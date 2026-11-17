#!/usr/bin/env node
// Genera los agentes de OpenCode (.opencode/agents/*.md) a partir de los de
// Claude Code (.claude/agents/*.md), que son la fuente única.
//
// - El cuerpo (instrucciones) se copia tal cual.
// - La descripción se copia.
// - La lista `tools` de Claude se traduce a `permission` de OpenCode (formato V1):
//   lo que no está en `tools` queda denegado.
//
// Uso: node scripts/sincronizar-agentes.mjs           -> escribe los archivos
//      node scripts/sincronizar-agentes.mjs --comprobar -> código 1 si no están sincronizados
// También exporta generarAgentesOpenCode(raiz) para el validador y las pruebas.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AVISO = '<!-- Generado por scripts/sincronizar-agentes.mjs a partir de .claude/agents/{nombre}.md. No editar a mano: edita el original y ejecuta `npm run sincronizar`. -->';

function partir(texto) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(texto);
  if (!m) return null;
  const datos = {};
  for (const l of m[1].split(/\r?\n/)) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(l);
    if (kv) datos[kv[1]] = kv[2].trim();
  }
  return { datos, cuerpo: m[2].replace(/^\s+/, '') };
}

/** Traduce las herramientas de Claude Code a permisos de OpenCode V1. */
export function permisosDesdeHerramientas(tools) {
  const t = new Set(String(tools || '').split(',').map((x) => x.trim()).filter(Boolean));
  const escribe = t.has('Write') || t.has('Edit') || t.has('MultiEdit');
  return {
    edit: escribe ? 'ask' : 'deny',
    bash: t.has('Bash') ? 'ask' : 'deny',
    webfetch: t.has('WebFetch') ? 'allow' : 'deny',
    websearch: t.has('WebSearch') ? 'allow' : 'deny',
    task: 'deny',
    skill: 'deny',
    external_directory: 'deny',
  };
}

export function generarAgentesOpenCode(raiz) {
  const dir = path.join(raiz, '.claude', 'agents');
  const salida = {};
  if (!existsSync(dir)) return salida;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
    const nombre = f.replace(/\.md$/, '');
    const p = partir(readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n'));
    if (!p) continue;
    const permisos = permisosDesdeHerramientas(p.datos.tools);
    const lineas = [
      '---',
      `description: ${JSON.stringify(p.datos.description || '')}`,
      'mode: subagent',
      'permission:',
      ...Object.entries(permisos).map(([k, v]) => `  ${k}: ${v}`),
      '---',
      '',
      AVISO.replace('{nombre}', nombre),
      '',
      p.cuerpo.trimEnd(),
      '',
    ];
    salida[path.join('.opencode', 'agents', f)] = lineas.join('\n');
  }
  return salida;
}

/** Devuelve la lista de archivos que no coinciden con lo generado. */
export function desincronizados(raiz) {
  const malos = [];
  for (const [rel, contenido] of Object.entries(generarAgentesOpenCode(raiz))) {
    const abs = path.join(raiz, rel);
    const actual = existsSync(abs) ? readFileSync(abs, 'utf8').replace(/\r\n/g, '\n') : null;
    if (actual !== contenido) malos.push(rel.replace(/\\/g, '/'));
  }
  return malos;
}

const esPrincipal = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (esPrincipal) {
  const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  if (process.argv.includes('--comprobar')) {
    const malos = desincronizados(raiz);
    if (malos.length) {
      console.log(`Agentes de OpenCode desincronizados: ${malos.join(', ')}\nEjecuta: npm run sincronizar`);
      process.exit(1);
    }
    console.log('Agentes de OpenCode sincronizados.');
  } else {
    mkdirSync(path.join(raiz, '.opencode', 'agents'), { recursive: true });
    for (const [rel, contenido] of Object.entries(generarAgentesOpenCode(raiz))) {
      writeFileSync(path.join(raiz, rel), contenido);
      console.log(`Generado ${rel.replace(/\\/g, '/')}`);
    }
  }
}
