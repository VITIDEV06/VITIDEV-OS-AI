#!/usr/bin/env node
// Comprueba que el OpenCode instalado carga VITIDEV IA OS, usando sus comandos
// `opencode debug` (no llama a ningún modelo, no necesita proveedor ni envía datos).
// Uso: npm run probar:opencode   -> código 1 si alguna comprobación falla.

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS = ['aprender', 'investigar', 'organizar', 'crear-proyecto', 'gestionar-memoria',
  'conocerme', 'estudiar', 'guardar', 'revisar-proyectos', 'cerrar-sesion'];
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

console.log('VITIDEV IA OS — comprobación de OpenCode (sin modelo)\n');

const version = spawnSync('opencode', ['--version'], { encoding: 'utf8', shell: process.platform === 'win32' });
if (version.status !== 0) {
  console.log('  ✖ OpenCode no está instalado o no está en el PATH (npm install -g opencode-ai).');
  process.exit(1);
}
console.log(`  · OpenCode ${version.stdout.trim()}`);

comprobar('opencode.json válido y sin modelo fijo', () => {
  const c = opencode(['debug', 'config']);
  exigir(c.instructions?.includes('memoria/personal/perfil.md'), 'instructions no incluye la memoria');
  exigir(!('model' in c) || c.model === undefined, `hay un modelo fijado: ${c.model}`);
  const cmds = Object.keys(c.command || {});
  const faltan = COMANDOS.filter((x) => !cmds.includes(x));
  exigir(!faltan.length, `faltan comandos: ${faltan.join(', ')}`);
  return `${COMANDOS.length} comandos personalizados`;
});

comprobar('skills compartidas detectadas', () => {
  const nombres = opencode(['debug', 'skill']).map((s) => s.name);
  const faltan = SKILLS.filter((x) => !nombres.includes(x));
  exigir(!faltan.length, `faltan: ${faltan.join(', ')}`);
  return `${SKILLS.length} skills`;
});

comprobar('skills detectadas aunque se desactive la compatibilidad con Claude Code', () => {
  const nombres = opencode(['debug', 'skill'], { OPENCODE_DISABLE_CLAUDE_CODE: '1' }).map((s) => s.name);
  const faltan = SKILLS.filter((x) => !nombres.includes(x));
  exigir(!faltan.length, `faltan: ${faltan.join(', ')}`);
});

for (const a of AGENTES) {
  comprobar(`agente ${a}`, () => {
    const j = opencode(['debug', 'agent', a]);
    exigir(j.mode === 'subagent', `mode=${j.mode}`);
    const regla = (perm) => [...j.permission].reverse().find((r) => r.permission === perm && r.pattern === '*')?.action;
    exigir(regla('edit') === 'deny', 'edit no está denegado');
    exigir(regla('bash') === 'deny', 'bash no está denegado');
    return `subagente, solo lectura, modelo ${j.model ? JSON.stringify(j.model) : 'heredado'}`;
  });
}

comprobar('permisos del agente principal (build)', () => {
  const reglas = opencode(['debug', 'agent', 'build']).permission;
  const busca = (perm, pat) => reglas.some((r) => r.permission === perm && r.pattern === pat && r.action === 'deny');
  exigir(busca('read', '*.env'), 'read *.env no está denegado');
  exigir(busca('bash', 'rm -rf *'), 'bash rm -rf no está denegado');
  exigir(busca('skill', 'conocerme'), 'la skill de comando conocerme no está oculta');
  return 'secretos, borrado recursivo y skills de comando';
});

console.log(`\n${fallos} fallo(s).`);
process.exit(fallos ? 1 : 0);
