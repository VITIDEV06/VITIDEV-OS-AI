// Pruebas del ecosistema OpenCode y de la independencia entre Claude Code y OpenCode:
// adaptador de reglas, plugin, configuración y ausencia de dependencias cruzadas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { traducir, evaluarOpenCode } from '../.opencode/lib/adaptador.mjs';
import { validar } from '../scripts/validar.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const d = (tool, args) => evaluarOpenCode(tool, args, RAIZ).decision;
const leer = (p) => readFileSync(path.join(RAIZ, p), 'utf8');

function copia() {
  const tmp = mkdtempSync(path.join(tmpdir(), 'vitidev-oc-'));
  cpSync(RAIZ, tmp, { recursive: true, filter: (s) => !s.includes('node_modules') && !s.includes(`${path.sep}.git`) });
  return tmp;
}

test('adaptador: traduce las herramientas de OpenCode al formato de las reglas', () => {
  assert.deepEqual(traducir('read', { filePath: 'a.md' }), [{ tool_name: 'Read', tool_input: { file_path: 'a.md' } }]);
  assert.deepEqual(traducir('bash', { command: 'ls' }), [{ tool_name: 'Bash', tool_input: { command: 'ls' } }]);
  assert.equal(traducir('apply_patch', { patchText: '*** Begin Patch\n*** Update File: x/.env\n*** Add File: y.md\n*** End Patch' }).length, 2);
  assert.deepEqual(traducir('webfetch', { url: 'https://x' }), []);
});

test('adaptador: bloquea secretos y acciones destructivas, y permite lo legítimo', () => {
  assert.equal(d('read', { filePath: path.join(RAIZ, '.env') }), 'deny');
  assert.equal(d('read', { filePath: path.join(RAIZ, 'secrets', 'x.txt') }), 'deny');
  assert.equal(d('bash', { command: 'rm -rf workspace' }), 'deny');
  assert.equal(d('bash', { command: 'Remove-Item x -Recurse -Force' }), 'deny');
  assert.equal(d('bash', { command: 'cat .env' }), 'deny');
  assert.equal(d('apply_patch', { patchText: '*** Update File: config/.env.local\n' }), 'deny');
  // "ask" (sobrescribir memoria con write) se convierte en bloqueo en OpenCode
  assert.equal(d('write', { filePath: path.join(RAIZ, 'memoria/objetivos.md'), content: 'x' }), 'deny');
  assert.equal(d('edit', { filePath: path.join(RAIZ, 'memoria/objetivos.md') }), 'allow');
  assert.equal(d('write', { filePath: path.join(RAIZ, 'workspace/inbox/nuevo.md') }), 'allow');
  assert.equal(d('read', { filePath: path.join(RAIZ, 'memoria/personal/perfil.md') }), 'allow');
  assert.equal(d('bash', { command: 'ls workspace' }), 'allow');
  assert.equal(d('websearch', { query: 'x' }), 'allow');
});

test('plugin: bloquea lanzando un error y añade el estado al prompt de sistema', async () => {
  const mod = await import(pathToFileURL(path.join(RAIZ, '.opencode/plugins/vitidev.js')).href);
  assert.deepEqual(Object.keys(mod), ['default'], 'el plugin solo debe exportar default');
  const hooks = await mod.default({ directory: RAIZ });
  await assert.rejects(
    hooks['tool.execute.before']({ tool: 'bash' }, { args: { command: 'rm -rf memoria' } }),
    /Bloqueado por seguridad/,
  );
  await hooks['tool.execute.before']({ tool: 'read' }, { args: { filePath: path.join(RAIZ, 'README.md') } });
  const salida = { system: [] };
  await hooks['experimental.chat.system.transform']({}, salida);
  assert.equal(salida.system.length, 1);
  assert.match(salida.system[0], /^\[VITIDEV OS AI\] Estado al iniciar sesión/);
});

test('independencia: el plugin y sus módulos solo importan código de .opencode y de Node.js', () => {
  for (const f of ['.opencode/plugins/vitidev.js', '.opencode/lib/adaptador.mjs', '.opencode/lib/reglas.mjs', '.opencode/lib/estado.mjs']) {
    for (const [, origen] of leer(f).matchAll(/from\s+'([^']+)'/g)) {
      assert.ok(origen.startsWith('node:') || origen.startsWith('./') || origen === '../lib/adaptador.mjs' || origen === '../lib/estado.mjs',
        `${f} importa ${origen}`);
    }
  }
});

test('independencia: instrucciones separadas y sin imports cruzados', () => {
  assert.equal(existsSync(path.join(RAIZ, 'CLAUDE.md')), false, 'CLAUDE.md debe estar en .claude/, no en la raíz');
  const claude = leer('.claude/CLAUDE.md');
  const agents = leer('AGENTS.md');
  assert.doesNotMatch(claude, /^@.*AGENTS\.md/m, '.claude/CLAUDE.md no debe importar AGENTS.md');
  assert.match(claude, /Reglas no negociables/);
  assert.match(agents, /Reglas no negociables/);
  const cfg = JSON.parse(leer('opencode.json'));
  assert.ok(cfg.instructions.every((i) => !i.startsWith('.claude/')), 'opencode.json no debe cargar reglas de .claude/');
  assert.equal(cfg.skills, undefined, 'opencode.json no debe registrar rutas de skills de Claude Code');
  assert.equal(cfg.permission.skill['*'], 'deny', 'las skills que no son de OpenCode se deniegan por defecto');
});

test('independencia: editar la skill de un ecosistema no cambia la del otro', () => {
  const tmp = copia();
  try {
    const cc = path.join(tmp, '.claude/skills/aprender/SKILL.md');
    const oc = path.join(tmp, '.opencode/skills/aprender/SKILL.md');
    const antes = readFileSync(oc, 'utf8');
    writeFileSync(cc, readFileSync(cc, 'utf8') + '\nSolo para Claude Code.\n');
    assert.equal(readFileSync(oc, 'utf8'), antes);
    assert.deepEqual(validar(tmp).errores, []);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('validador: detecta dependencias cruzadas entre ecosistemas', () => {
  const tmp = copia();
  try {
    const cfgPath = path.join(tmp, 'opencode.json');
    const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
    cfg.instructions.push('.claude/rules/estilo.md');
    cfg.skills = { paths: ['.claude/skills'] };
    writeFileSync(cfgPath, JSON.stringify(cfg));
    const plugin = path.join(tmp, '.opencode/plugins/vitidev.js');
    writeFileSync(plugin, readFileSync(plugin, 'utf8').replace("'../lib/estado.mjs'", "'../../.claude/hooks/lib/estado.mjs'"));
    const claudeMd = path.join(tmp, '.claude/CLAUDE.md');
    writeFileSync(claudeMd, readFileSync(claudeMd, 'utf8') + '\n@../AGENTS.md\n');
    const txt = validar(tmp).errores.join('\n');
    assert.match(txt, /opencode\.json carga \.claude\/rules\/estilo\.md/);
    assert.match(txt, /opencode\.json carga \.claude\/skills/);
    assert.match(txt, /vitidev\.js:\d+ usa un recurso de Claude Code/);
    assert.match(txt, /\.claude\/CLAUDE\.md importa AGENTS\.md/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('validador: detecta errores en la configuración de OpenCode', () => {
  const tmp = copia();
  try {
    const cfgPath = path.join(tmp, 'opencode.json');
    const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
    cfg.model = 'anthropic/claude-sonnet-5-5';
    delete cfg.permission.skill['*'];
    writeFileSync(cfgPath, JSON.stringify(cfg));
    writeFileSync(path.join(tmp, '.opencode/commands/guardar.md'), '---\ndescription: x\n---\nsin argumentos\n');
    const ag = path.join(tmp, '.opencode/agents/tutor.md');
    writeFileSync(ag, readFileSync(ag, 'utf8').replace('mode: subagent', 'mode: subagent\ntools: Read'));
    const txt = validar(tmp).errores.join('\n');
    assert.match(txt, /no fijes "model"/);
    assert.match(txt, /permission\.skill debe empezar por "\*": "deny"/);
    assert.match(txt, /guardar\.md: no pasa \$ARGUMENTS/);
    assert.match(txt, /tutor\.md: usa permission, no tools/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
