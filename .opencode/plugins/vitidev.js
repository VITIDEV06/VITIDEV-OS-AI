// Plugin de VITIDEV IA OS para OpenCode (formato de plugins de OpenCode V1).
// Equivale a los dos hooks de Claude Code y reutiliza su misma lógica:
//   - tool.execute.before  -> protección (igual que .claude/hooks/proteger.mjs)
//   - experimental.chat.system.transform -> estado al iniciar (igual que session-start.mjs)
// Sin dependencias. Este archivo solo debe tener el export por defecto:
// OpenCode trata cada export como un plugin.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluarOpenCode } from '../../.claude/hooks/lib/opencode.mjs';
import { calcularEstado, formatear } from '../../.claude/hooks/lib/estado.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export default async function vitidev({ directory } = {}) {
  const raiz = directory || RAIZ;
  return {
    'tool.execute.before': async (input, output) => {
      const { decision, motivo } = evaluarOpenCode(input?.tool, output?.args, raiz);
      if (decision === 'deny') throw new Error(motivo);
    },
    'experimental.chat.system.transform': async (_input, output) => {
      try {
        if (Array.isArray(output?.system)) output.system.push(formatear(calcularEstado(raiz)));
      } catch {
        // Si falla, la sesión sigue sin el resumen de estado.
      }
    },
  };
}
