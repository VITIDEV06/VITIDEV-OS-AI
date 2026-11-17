#!/usr/bin/env node
// Hook SessionStart de VITIDEV OS AI.
// Inyecta en el contexto un resumen del estado: perfil, proyectos, plazos,
// repasos, inbox y próximos pasos de la última sesión.
// Nunca bloquea: ante cualquier error sale con código 0 sin salida.

import { calcularEstado, formatear } from './lib/estado.mjs';

let datos = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => (datos += c));
process.stdin.on('end', () => {
  try {
    let entrada = {};
    try { entrada = JSON.parse(datos || '{}'); } catch { /* entrada opcional */ }
    const raiz = process.env.CLAUDE_PROJECT_DIR || entrada.cwd || process.cwd();
    const texto = formatear(calcularEstado(raiz));
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: texto },
    }));
  } catch {
    // Silencio: el sistema funciona igual sin este contexto.
  }
  process.exit(0);
});
