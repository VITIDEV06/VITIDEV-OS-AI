// Pruebas de los flujos de memoria y del hook SessionStart.
// Simulan sobre una copia temporal lo que hacen las skills (crear proyecto,
// cambiar de estado, registrar aprendizaje, cerrar sesión) y comprueban que
// los formatos de las plantillas son los que entiende el hook de inicio.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { calcularEstado, formatear, proyectosDe, frontmatter, dias } from '../.claude/hooks/lib/estado.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PLANTILLAS = path.join(RAIZ, '.claude/skills');
const HOY = '2026-11-16';
let tmp;

const leer = (r) => readFileSync(path.join(tmp, r), 'utf8');
const escribir = (r, t) => { mkdirSync(path.dirname(path.join(tmp, r)), { recursive: true }); writeFileSync(path.join(tmp, r), t); };

/** Rellena la plantilla de registro como lo haría la skill crear-proyecto. */
function registro(slug, limite, proximo) {
  return readFileSync(path.join(PLANTILLAS, 'crear-proyecto/plantilla-registro.md'), 'utf8')
    .replaceAll('<slug>', slug)
    .replace('<Nombre legible>', slug)
    .replace('personal | universidad | trabajo', 'universidad')
    .replace('<una línea>', 'Objetivo de prueba')
    .replace('AAAA-MM-DD | sin fecha', limite)
    .replace('<una acción>', proximo)
    .replace('AAAA-MM-DD', HOY);
}

before(() => {
  tmp = mkdtempSync(path.join(tmpdir(), 'vitidev-mem-'));
  cpSync(path.join(RAIZ, 'memoria'), path.join(tmp, 'memoria'), { recursive: true });
  cpSync(path.join(RAIZ, 'workspace'), path.join(tmp, 'workspace'), { recursive: true });
});
after(() => rmSync(tmp, { recursive: true, force: true }));

test('utilidades: frontmatter y días', () => {
  assert.deepEqual(frontmatter('---\na: 1\nb: x y\n---\n# t'), { a: '1', b: 'x y' });
  assert.equal(dias('2026-11-16', '2026-11-20'), 4);
  assert.equal(dias('2026-11-16', '2026-11-10'), -6);
});

test('estado inicial (plantillas vacías): perfil sin completar y sin proyectos', () => {
  const e = calcularEstado(tmp, HOY);
  assert.equal(e.perfilCompleto, false);
  assert.equal(e.activos.length, 0);
  assert.equal(e.nPausados, 0);
  assert.equal(e.inboxArchivos, 1); // ejemplo-notas-sueltas.md
  assert.match(formatear(e), /sugiere ejecutar \/conocerme/);
});

test('/conocerme: completar el perfil cambia el estado', () => {
  escribir('memoria/personal/perfil.md', leer('memoria/personal/perfil.md')
    .replace('estado: sin-completar', 'estado: completo')
    .replace('- Nombre: _sin completar_', '- Nombre: Ana'));
  const e = calcularEstado(tmp, HOY);
  assert.equal(e.perfilCompleto, true);
  assert.doesNotMatch(formatear(e), /conocerme/);
});

test('crear-proyecto: la entrada de la plantilla se reconoce como proyecto activo', () => {
  const activos = leer('memoria/proyectos/activos.md')
    .replace(/_Sin proyectos activos.*_/, registro('base-de-datos', '2026-11-20', 'Hacer diagrama ER') + '\n' + registro('app-gastos', 'sin fecha', 'Definir pantallas'));
  escribir('memoria/proyectos/activos.md', activos);
  const e = calcularEstado(tmp, HOY);
  assert.deepEqual(e.activos.map((p) => p.slug), ['base-de-datos', 'app-gastos']);
  assert.equal(e.activos[0].proximo, 'Hacer diagrama ER');
  assert.equal(e.alertas.length, 1);
  assert.match(e.alertas[0], /"base-de-datos" vence en 4 día\(s\)/);
});

test('cambiar estado: mover un proyecto de activos a pausados', () => {
  const activos = leer('memoria/proyectos/activos.md');
  const bloque = activos.slice(activos.indexOf('## app-gastos'));
  escribir('memoria/proyectos/activos.md', activos.replace(bloque, ''));
  escribir('memoria/proyectos/pausados.md', leer('memoria/proyectos/pausados.md')
    .replace('_Sin proyectos pausados._', bloque.trimEnd() + '\n- Motivo de pausa: exámenes\n- Condición para retomar: fin del semestre\n'));
  const e = calcularEstado(tmp, HOY);
  assert.deepEqual(e.activos.map((p) => p.slug), ['base-de-datos']);
  assert.equal(e.nPausados, 1);
  assert.equal(proyectosDe(leer('memoria/proyectos/pausados.md'))[0].campos['motivo de pausa'], 'exámenes');
});

test('aprender: un aprendizaje con repaso vencido aparece como pendiente', () => {
  const plantilla = readFileSync(path.join(PLANTILLAS, 'aprender/plantilla-aprendizaje.md'), 'utf8')
    .replace('tema: <Tema>', 'tema: Derivadas parciales')
    .replace('fecha: AAAA-MM-DD', 'fecha: 2026-11-10')
    .replace('proximo-repaso: AAAA-MM-DD', 'proximo-repaso: 2026-11-13');
  escribir('memoria/aprendizajes/2026-11-10-derivadas-parciales.md', plantilla);
  const e = calcularEstado(tmp, HOY);
  assert.deepEqual(e.repasos, ['Derivadas parciales']);
});

test('cerrar-sesion: los próximos pasos del último registro se recuperan', () => {
  escribir('memoria/sesiones/2026-11-14.md', '# 2026-11-14\n## Sesión 10:00\n**Próximos pasos:**\n- [ ] viejo\n');
  escribir('memoria/sesiones/2026-11-15.md',
    '# 2026-11-15\n## Sesión 09:00\n**Próximos pasos:**\n- [ ] antiguo\n\n## Sesión 18:30\n**Hecho:** x\n**Próximos pasos:**\n- [ ] Terminar diagrama ER\n- [x] hecho\n- [ ] Repasar derivadas\n');
  const e = calcularEstado(tmp, HOY);
  assert.equal(e.ultimaSesion.fecha, '2026-11-15');
  assert.deepEqual(e.ultimaSesion.pasos, ['Terminar diagrama ER', 'Repasar derivadas']);
});

test('guardar: datos en memoria/inbox.md se cuentan como pendientes de organizar', () => {
  escribir('memoria/inbox.md', leer('memoria/inbox.md').replace('_Vacío._', '- 2026-11-16 — Le gusta el café\n- 2026-11-16 — Usa Notion'));
  assert.equal(calcularEstado(tmp, HOY).inboxMemoria, 2);
});

test('integración: el hook SessionStart produce JSON con additionalContext', () => {
  const r = spawnSync(process.execPath, [path.join(RAIZ, '.claude/hooks/session-start.mjs')], {
    input: JSON.stringify({ hook_event_name: 'SessionStart', source: 'startup' }),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: tmp },
  });
  assert.equal(r.status, 0);
  const out = JSON.parse(r.stdout);
  assert.equal(out.hookSpecificOutput.hookEventName, 'SessionStart');
  const ctx = out.hookSpecificOutput.additionalContext;
  assert.match(ctx, /\[VITIDEV OS AI\]/);
  assert.match(ctx, /base-de-datos — próximo paso: Hacer diagrama ER/);
  assert.match(ctx, /Pendiente: Terminar diagrama ER/);
  assert.match(ctx, /Repasos pendientes: Derivadas parciales/);
});

test('integración: el hook SessionStart no falla en una carpeta vacía', () => {
  const vacia = mkdtempSync(path.join(tmpdir(), 'vitidev-vacia-'));
  try {
    const r = spawnSync(process.execPath, [path.join(RAIZ, '.claude/hooks/session-start.mjs')], {
      input: '', encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: vacia },
    });
    assert.equal(r.status, 0);
    assert.match(JSON.parse(r.stdout).hookSpecificOutput.additionalContext, /0 activo/);
  } finally {
    rmSync(vacia, { recursive: true, force: true });
  }
});
