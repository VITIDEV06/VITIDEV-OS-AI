// Plugin de VITIDEV OS AI para OpenCode (formato de plugins de OpenCode V1).
//   - tool.execute.before               -> protección en tiempo real
//   - experimental.chat.system.transform -> resumen de estado al iniciar
// Usa solo módulos del ecosistema OpenCode (.opencode/lib/) y Node.js, sin dependencias.
// Este archivo solo debe tener el export por defecto: OpenCode trata cada export como un plugin.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluarOpenCode } from '../lib/adaptador.mjs';
import { calcularEstado, formatear } from '../lib/estado.mjs';

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
