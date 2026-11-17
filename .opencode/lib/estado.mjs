// Calcula el estado del sistema para el plugin de OpenCode (copia propia del ecosistema OpenCode).
// Solo lee archivos; nunca escribe. Cualquier archivo ausente se trata como vacío.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

function leer(ruta) {
  try { return readFileSync(ruta, 'utf8'); } catch { return ''; }
}

function listar(dir) {
  try { return readdirSync(dir, { withFileTypes: true }); } catch { return []; }
}

/** Extrae el frontmatter YAML simple (clave: valor) de un Markdown. */
export function frontmatter(texto) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(texto);
  const res = {};
  if (!m) return res;
  for (const linea of m[1].split(/\r?\n/)) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(linea);
    if (kv) res[kv[1]] = kv[2].trim();
  }
  return res;
}

/** Devuelve las secciones `## slug` de un registro de proyectos con sus campos. */
export function proyectosDe(texto) {
  const proyectos = [];
  const bloques = texto.split(/^## /m).slice(1);
  for (const b of bloques) {
    const [cabecera, ...resto] = b.split(/\r?\n/);
    const campos = {};
    for (const l of resto) {
      const kv = /^-\s*([^:]+):\s*(.*)$/.exec(l.trim());
      if (kv) campos[kv[1].trim().toLowerCase()] = kv[2].trim();
    }
    proyectos.push({ slug: cabecera.trim(), campos });
  }
  return proyectos;
}

/** Diferencia en días entre dos fechas AAAA-MM-DD (b - a). */
export function dias(a, b) {
  const pa = Date.parse(a + 'T00:00:00Z');
  const pb = Date.parse(b + 'T00:00:00Z');
  if (Number.isNaN(pa) || Number.isNaN(pb)) return null;
  return Math.round((pb - pa) / 86400000);
}

export function hoyLocal(fecha = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}`;
}

export function calcularEstado(raiz, hoy = hoyLocal()) {
  const mem = path.join(raiz, 'memoria');

  const perfil = frontmatter(leer(path.join(mem, 'personal', 'perfil.md')));
  const activos = proyectosDe(leer(path.join(mem, 'proyectos', 'activos.md')));
  const pausados = proyectosDe(leer(path.join(mem, 'proyectos', 'pausados.md')));
  const finalizados = proyectosDe(leer(path.join(mem, 'proyectos', 'finalizados.md')));

  const alertas = [];
  for (const p of activos) {
    const limite = p.campos['fecha límite'] || p.campos['fecha limite'];
    if (limite && /^\d{4}-\d{2}-\d{2}$/.test(limite)) {
      const d = dias(hoy, limite);
      if (d !== null && d < 0) alertas.push(`"${p.slug}" venció hace ${-d} día(s) (${limite})`);
      else if (d !== null && d <= 7) alertas.push(`"${p.slug}" vence en ${d} día(s) (${limite})`);
    }
  }

  // Aprendizajes con repaso pendiente
  const repasos = [];
  for (const e of listar(path.join(mem, 'aprendizajes'))) {
    if (!e.isFile() || !e.name.endsWith('.md') || e.name === 'INDICE.md') continue;
    const fm = frontmatter(leer(path.join(mem, 'aprendizajes', e.name)));
    if (fm['proximo-repaso'] && /^\d{4}-\d{2}-\d{2}$/.test(fm['proximo-repaso'])
        && dias(fm['proximo-repaso'], hoy) >= 0) {
      repasos.push(fm.tema || e.name.replace(/\.md$/, ''));
    }
  }

  // Inbox pendiente
  const inboxArchivos = listar(path.join(raiz, 'workspace', 'inbox'))
    .filter((e) => e.name !== 'README.md' && !e.name.startsWith('.')).length;
  const inboxMemoria = (leer(path.join(mem, 'inbox.md')).match(/^- \d{4}-\d{2}-\d{2}/gm) || []).length;

  // Última sesión: archivo AAAA-MM-DD.md más reciente y sus próximos pasos
  const sesiones = listar(path.join(mem, 'sesiones'))
    .filter((e) => e.isFile() && /^\d{4}-\d{2}-\d{2}\.md$/.test(e.name))
    .map((e) => e.name).sort();
  let ultimaSesion = null;
  if (sesiones.length) {
    const nombre = sesiones[sesiones.length - 1];
    const texto = leer(path.join(mem, 'sesiones', nombre));
    const idx = texto.lastIndexOf('**Próximos pasos:**');
    const pasos = idx >= 0
      ? texto.slice(idx).split(/\r?\n/).slice(1)
          .filter((l) => /^\s*- \[ \]/.test(l)).map((l) => l.replace(/^\s*- \[ \]\s*/, '')).slice(0, 5)
      : [];
    ultimaSesion = { fecha: nombre.replace(/\.md$/, ''), pasos };
  }

  return {
    hoy,
    perfilCompleto: perfil.estado === 'completo',
    activos: activos.map((p) => ({ slug: p.slug, proximo: p.campos['próximo paso'] || p.campos['proximo paso'] || '' })),
    nPausados: pausados.length,
    nFinalizados: finalizados.length,
    alertas,
    repasos,
    inboxArchivos,
    inboxMemoria,
    ultimaSesion,
  };
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export function formatear(e) {
  const l = [];
  const diaSemana = DIAS[new Date(e.hoy + 'T12:00:00').getDay()] || '';
  l.push(`[VITIDEV OS AI] Estado al iniciar sesión — hoy es ${diaSemana} ${e.hoy}.`);
  if (!e.perfilCompleto) l.push('- Perfil del usuario sin completar: sugiere ejecutar /conocerme.');
  l.push(`- Proyectos: ${e.activos.length} activo(s), ${e.nPausados} pausado(s), ${e.nFinalizados} finalizado(s).`);
  for (const p of e.activos) l.push(`  • ${p.slug}${p.proximo ? ` — próximo paso: ${p.proximo}` : ''}`);
  for (const a of e.alertas) l.push(`- ALERTA de plazo: ${a}.`);
  if (e.repasos.length) l.push(`- Repasos pendientes: ${e.repasos.join(', ')} (sugiere /estudiar).`);
  if (e.inboxArchivos || e.inboxMemoria) {
    l.push(`- Inbox: ${e.inboxArchivos} archivo(s) en workspace/inbox y ${e.inboxMemoria} dato(s) en memoria/inbox.md (sugiere /organizar).`);
  }
  if (e.ultimaSesion) {
    l.push(`- Última sesión cerrada: ${e.ultimaSesion.fecha}.`);
    for (const p of e.ultimaSesion.pasos) l.push(`  • Pendiente: ${p}`);
  }
  l.push('Usa este estado para saludar brevemente y proponer por dónde empezar; no lo repitas entero.');
  return l.join('\n');
}
