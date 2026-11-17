// Pruebas de la capa de compatibilidad con OpenCode:
// adaptador de reglas, plugin, sincronización de agentes y validación de la configuración.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { traducir, evaluarOpenCode } from '../.claude/hooks/lib/opencode.mjs';
import { generarAgentesOpenCode, desincronizados, permisosDesdeHerramientas } from '../scripts/sincronizar-agentes.mjs';
import { validar } from '../scripts/validar.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const d = (tool, args) => evaluarOpenCode(tool, args, RAIZ).decision;

function copia() {
  const tmp = mkdtempSync(path.join(tmpdir(), 'vitidev-oc-'));
  cpSync(RAIZ, tmp, { recursive: true, filter: (s) => !s.includes('node_modules') });
  return tmp;
}

test('adaptador: traduce las herramientas de OpenCode al formato de las reglas', () => {
  assert.deepEqual(traducir('read', { filePath: 'a.md' }), [{ tool_name: 'Read', tool_input: { file_path: 'a.md' } }]);
  assert.deepEqual(traducir('bash', { command: 'ls' }), [{ tool_name: 'Bash', tool_input: { command: 'ls' } }]);
  assert.equal(traducir('apply_patch', { patchText: '*** Begin Patch\n*** Update File: x/.env\n*** Add File: y.md\n*** End Patch' }).length, 2);
  assert.deepEqual(traducir('webfetch', { url: 'https://x' }), []);
});

test('adaptador: aplica la misma política que el hook de Claude Code', () => {
  assert.equal(d('read', { filePath: path.join(RAIZ, '.env') }), 'deny');
  assert.equal(d('read', { filePath: path.join(RAIZ, 'secrets', 'x.txt') }), 'deny');
  assert.equal(d('bash', { command: 'rm -rf workspace' }), 'deny');
  assert.equal(d('bash', { command: 'Remove-Item x -Recurse -Force' }), 'deny');
  assert.equal(d('bash', { command: 'cat .env' }), 'deny');
  assert.equal(d('apply_patch', { patchText: '*** Update File: config/.env.local\n' }), 'deny');
  // "ask" (sobrescribir memoria con write) se convierte en bloqueo en OpenCode
  assert.equal(d('write', { filePath: path.join(RAIZ, 'memoria/objetivos.md'), content: 'x' }), 'deny');
  // Lo legítimo se permite
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
  assert.match(salida.system[0], /^\[VITIDEV IA OS\] Estado al iniciar sesión/);
});

test('sincronización: los agentes de OpenCode se generan desde los de Claude Code', () => {
  assert.deepEqual(desincronizados(RAIZ), []);
  const gen = generarAgentesOpenCode(RAIZ);
  assert.equal(Object.keys(gen).length, 3);
  const pm = gen[path.join('.opencode', 'agents', 'project-manager.md')];
  assert.match(pm, /^mode: subagent$/m);
  assert.match(pm, /^ {2}edit: deny$/m);
  assert.match(pm, /^ {2}websearch: deny$/m);
  assert.doesNotMatch(pm, /^model:/m);
  const claude = readFileSync(path.join(RAIZ, '.claude/agents/project-manager.md'), 'utf8').replace(/\r\n/g, '\n');
  assert.ok(pm.includes(claude.split('\n---\n')[1].trim()), 'el cuerpo debe copiarse sin cambios');
  assert.deepEqual(permisosDesdeHerramientas('Read, Write, Bash'), {
    edit: 'ask', bash: 'ask', webfetch: 'deny', websearch: 'deny', task: 'deny', skill: 'deny', external_directory: 'deny',
  });
});

test('sincronización: un cambio en el agente de Claude se detecta como desincronizado', () => {
  const tmp = copia();
  try {
    const f = path.join(tmp, '.claude/agents/tutor.md');
    writeFileSync(f, readFileSync(f, 'utf8') + '\nNueva instrucción.\n');
    assert.deepEqual(desincronizados(tmp), ['.opencode/agents/tutor.md']);
    assert.match(validar(tmp).errores.join('\n'), /tutor\.md no está sincronizado/);
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
    cfg.instructions = cfg.instructions.filter((i) => i !== 'memoria/objetivos.md');
    delete cfg.permission.skill.conocerme;
    writeFileSync(cfgPath, JSON.stringify(cfg));
    writeFileSync(path.join(tmp, '.opencode/commands/guardar.md'), '---\ndescription: x\n---\nsin argumentos\n');
    const txt = validar(tmp).errores.join('\n');
    assert.match(txt, /no fijes "model"/);
    assert.match(txt, /La memoria cargada no coincide/);
    assert.match(txt, /permission\.skill\.conocerme debe ser "deny"/);
    assert.match(txt, /guardar\.md: no pasa \$ARGUMENTS/);
    assert.match(txt, /guardar\.md: no menciona la skill `guardar`/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('fuente única: CLAUDE.md importa AGENTS.md y no repite sus instrucciones', () => {
  const claude = readFileSync(path.join(RAIZ, 'CLAUDE.md'), 'utf8');
  const agents = readFileSync(path.join(RAIZ, 'AGENTS.md'), 'utf8');
  assert.match(claude, /^@AGENTS\.md$/m);
  assert.match(agents, /Reglas no negociables/);
  assert.doesNotMatch(claude, /Reglas no negociables/);
});
