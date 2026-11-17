// Adaptador de OpenCode para .opencode/lib/reglas.mjs.
// Traduce una llamada a herramienta de OpenCode (nombre en minúsculas y
// argumentos en camelCase) al formato interno de reglas.mjs (Read, Edit, Write, Bash, Grep),
// para evaluar la política de protección de OpenCode.

import { evaluar } from './reglas.mjs';

/** Extrae las rutas de un parche de OpenCode (`*** Update File: ruta`). */
function rutasDeParche(texto) {
  return [...String(texto || '').matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm)].map((m) => m[1].trim());
}

/**
 * Devuelve una lista de entradas en el formato interno de reglas.mjs.
 * Herramientas desconocidas devuelven [] (no se bloquean).
 */
export function traducir(herramienta, args = {}) {
  const a = args || {};
  switch (String(herramienta || '').toLowerCase()) {
    case 'read':
      return [{ tool_name: 'Read', tool_input: { file_path: a.filePath || a.file_path || '' } }];
    case 'write':
      return [{ tool_name: 'Write', tool_input: { file_path: a.filePath || a.file_path || '' } }];
    case 'edit':
    case 'multiedit':
      return [{ tool_name: 'Edit', tool_input: { file_path: a.filePath || a.file_path || '' } }];
    case 'patch':
    case 'apply_patch':
      return rutasDeParche(a.patchText || a.patch).map((p) => ({ tool_name: 'Edit', tool_input: { file_path: p } }));
    case 'bash':
      return [{ tool_name: 'Bash', tool_input: { command: a.command || '' } }];
    case 'glob':
    case 'grep':
    case 'list':
      return [{ tool_name: 'Grep', tool_input: { path: a.path || '' } }];
    default:
      return [];
  }
}

/**
 * Evalúa una llamada de OpenCode. Devuelve { decision, motivo }.
 * En OpenCode un plugin no puede "preguntar": la decisión 'ask' se convierte en
 * bloqueo con una explicación para que el agente use la alternativa segura.
 */
export function evaluarOpenCode(herramienta, args, dirProyecto) {
  for (const entrada of traducir(herramienta, args)) {
    const r = evaluar(entrada, dirProyecto);
    if (r.decision === 'deny') return r;
    if (r.decision === 'ask') {
      return { decision: 'deny', motivo: `${r.motivo} En OpenCode esta acción se bloquea: usa la herramienta edit para cambios puntuales, mostrando antes el cambio al usuario.` };
    }
  }
  return { decision: 'allow', motivo: '' };
}
