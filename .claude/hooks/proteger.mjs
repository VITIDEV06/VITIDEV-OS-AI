#!/usr/bin/env node
// Hook PreToolUse de VITIDEV OS AI.
// Lee el evento JSON por stdin y decide:
//   - deny  -> sale con código 2 y el motivo en stderr (Claude Code bloquea la herramienta)
//   - ask   -> imprime JSON con permissionDecision "ask" (Claude Code pregunta al usuario)
//   - allow -> sale con código 0 sin salida (sigue el flujo normal de permisos)
// Si algo falla al leer la entrada, NO bloquea (código 0) para no romper la sesión.

import { evaluar } from './lib/reglas.mjs';

let datos = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => (datos += c));
process.stdin.on('end', () => {
  let entrada;
  try {
    entrada = JSON.parse(datos || '{}');
  } catch {
    process.exit(0);
  }
  const dirProyecto = process.env.CLAUDE_PROJECT_DIR || entrada.cwd || process.cwd();
  const { decision, motivo } = evaluar(entrada, dirProyecto);

  if (decision === 'deny') {
    process.stderr.write(motivo + '\n');
    process.exit(2);
  }
  if (decision === 'ask') {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: motivo,
      },
    }));
  }
  process.exit(0);
});
