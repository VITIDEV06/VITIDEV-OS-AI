#!/usr/bin/env node
// Comprueba que el OpenCode instalado carga VITIDEV OS AI solo con recursos propios de OpenCode,
// usando sus comandos `opencode debug` (no llama a ningún modelo, no necesita proveedor ni envía datos).
// Uso: npm run probar:opencode   -> código 1 si alguna comprobación falla.

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Skills propias de OpenCode (.opencode/skills) y skills que solo existen en Claude Code.
const SKILLS = ['aprender', 'investigar', 'organizar', 'crear-proyecto', 'gestionar-memoria'];
const SOLO_CLAUDE = ['conocerme', 'estudiar', 'guardar', 'revisar-proyectos', 'cerrar-sesion'];
const AGENTES = ['tutor', 'investigador', 'project-manager'];
const COMANDOS = ['conocerme', 'estudiar', 'investigar', 'guardar', 'revisar-proyectos', 'cerrar-sesion'];

function opencode(args, env = {}) {
  const r = spawnSync('opencode', args, {
    cwd: RAIZ, encoding: 'utf8', shell: process.platform === 'win32', timeout: 120000,
    env: { ...process.env, ...env }, maxBuffer: 64 * 1024 * 1024,
  });
  if (r.error || r.status !== 0) throw new Error((r.error?.message || r.stderr || '').trim() || `código ${r.status}`);
  return JSON.parse(r.stdout);
}

let fallos = 0;
function comprobar(nombre, fn) {
  try {
    const detalle = fn();
    console.log(`  ✔ ${nombre}${detalle ? ` — ${detalle}` : ''}`);
  } catch (e) {
    fallos++;
    console.log(`  ✖ ${nombre} — ${e.message.split('\n')[0]}`);
  }
}
const exigir = (cond, msg) => { if (!cond) throw new Error(msg); };
const sep = (p) => String(p || '').replace(/\\/g, '/');

// Reglas de permisos de OpenCode: la última que coincide gana.
const comodin = (patron) => new RegExp(`^${patron.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
const accion = (reglas, permiso, valor) =>
  [...reglas].reverse().find((r) => r.permission === permiso && comodin(r.pattern).test(valor))?.action;

console.log('VITIDEV OS AI — comprobación de OpenCode (sin modelo)\n');

const version = spawnSync('opencode', ['--version'], { encoding: 'utf8', shell: process.platform === 'win32' });
if (version.status !== 0) {
  console.log('  ✖ OpenCode no está instalado o no está en el PATH (npm install -g opencode-ai).');
  process.exit(1);
}
console.log(`  · OpenCode ${version.stdout.trim()}`);

comprobar('opencode.json válido, sin modelo fijo y sin reglas de Claude Code', () => {
  const c = opencode(['debug', 'config']);
  exigir(c.instructions?.includes('memoria/personal/perfil.md'), 'instructions no incluye la memoria');
  exigir(!c.instructions.some((i) => i.startsWith('.claude/')), 'instructions carga archivos de .claude/');
  exigir(!('model' in c) || c.model === undefined, `hay un modelo fijado: ${c.model}`);
  const cmds = Object.keys(c.command || {});
  const faltan = COMANDOS.filter((x) => !cmds.includes(x));
  exigir(!faltan.length, `faltan comandos: ${faltan.join(', ')}`);
  return `${COMANDOS.length} comandos personalizados`;
});

comprobar('skills propias cargadas desde .opencode/skills', () => {
  const skills = opencode(['debug', 'skill']);
  for (const id of SKILLS) {
    const s = skills.find((x) => x.name === id);
    exigir(s, `falta ${id}`);
    exigir(sep(s.location).includes('/.opencode/skills/'), `${id} se carga desde ${s.location}`);
  }
  return `${SKILLS.length} skills, todas de .opencode/skills`;
});

comprobar('el agente principal no puede usar skills de Claude Code', () => {
  const reglas = opencode(['debug', 'agent', 'build']).permission;
  for (const id of SKILLS) exigir(accion(reglas, 'skill', id) === 'allow', `${id} no está permitida`);
  for (const id of [...SOLO_CLAUDE, 'cualquier-skill-de-claude']) exigir(accion(reglas, 'skill', id) === 'deny', `${id} no está denegada`);
  return 'solo las 5 propias; el resto, denegadas';
});

comprobar('con OPENCODE_DISABLE_CLAUDE_CODE_SKILLS=1 no se descubre ninguna skill de .claude', () => {
  const skills = opencode(['debug', 'skill'], { OPENCODE_DISABLE_CLAUDE_CODE_SKILLS: '1' });
  const deClaude = skills.filter((x) => sep(x.location).includes('/.claude/'));
  exigir(!deClaude.length, `siguen apareciendo: ${deClaude.map((x) => x.name).join(', ')}`);
  const faltan = SKILLS.filter((x) => !skills.some((s) => s.name === x));
  exigir(!faltan.length, `faltan: ${faltan.join(', ')}`);
});

for (const a of AGENTES) {
  comprobar(`agente ${a}`, () => {
    const j = opencode(['debug', 'agent', a]);
    exigir(j.mode === 'subagent', `mode=${j.mode}`);
    exigir(accion(j.permission, 'edit', 'x.md') === 'deny', 'edit no está denegado');
    exigir(accion(j.permission, 'bash', 'ls') === 'deny', 'bash no está denegado');
    return `subagente, solo lectura, modelo ${j.model ? JSON.stringify(j.model) : 'heredado'}`;
  });
}

comprobar('permisos del agente principal (build)', () => {
  const reglas = opencode(['debug', 'agent', 'build']).permission;
  exigir(accion(reglas, 'read', 'config/.env') === 'deny', 'leer .env no está denegado');
  exigir(accion(reglas, 'bash', 'rm -rf workspace') === 'deny', 'el borrado recursivo no está denegado');
  return 'secretos y borrado recursivo';
});

console.log(`\n${fallos} fallo(s).`);
process.exit(fallos ? 1 : 0);
