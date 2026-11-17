// Reglas de protección de VITIDEV IA OS.
// Módulo puro (sin E/S salvo existsSync) para poder probarlo de forma aislada.
// evaluar(entrada, dirProyecto) -> { decision: 'allow' | 'ask' | 'deny', motivo }

import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

/** Normaliza una ruta para comparar: barras '/', minúsculas en Windows. */
export function normalizar(ruta) {
  let r = String(ruta || '').replace(/\\/g, '/');
  if (process.platform === 'win32') r = r.toLowerCase();
  return r.replace(/\/+$/, '');
}

const PLANTILLAS_PERMITIDAS = /(^|\/)\.env\.(example|sample|template)$/i;

const PATRONES_SECRETOS = [
  { re: /(^|\/)\.env(\.[^/]*)?$/i, motivo: 'archivo de variables de entorno (.env)' },
  { re: /\.(pem|key|p12|pfx)$/i, motivo: 'clave o certificado privado' },
  { re: /(^|\/)id_(rsa|ed25519|ecdsa|dsa)$/i, motivo: 'clave SSH privada' },
  { re: /(^|\/)(secrets|credenciales|credentials)(\/|$)/i, motivo: 'carpeta de secretos' },
];

/** Devuelve el motivo si la ruta apunta a un secreto; si no, null. */
export function esSecreto(ruta) {
  const r = String(ruta || '').replace(/\\/g, '/');
  if (!r || PLANTILLAS_PERMITIDAS.test(r)) return null;
  for (const { re, motivo } of PATRONES_SECRETOS) if (re.test(r)) return motivo;
  return null;
}

function dentroDe(ruta, base) {
  const r = normalizar(ruta);
  const b = normalizar(base);
  return r === b || r.startsWith(b + '/');
}

function absoluta(ruta, dirProyecto) {
  return path.isAbsolute(ruta) ? ruta : path.join(dirProyecto, ruta);
}

// Comandos de shell prohibidos (deny). Se evalúan sobre el comando completo.
const COMANDOS_PROHIBIDOS = [
  { re: /\brm\s+(-[a-z]*r[a-z]*|--recursive)\b/i, motivo: 'borrado recursivo (rm -r / rm -rf)' },
  { re: /\bRemove-Item\b[^|;&]*-Recurse\b/i, motivo: 'borrado recursivo (Remove-Item -Recurse)' },
  { re: /\b(rd|rmdir)\s+\/s\b/i, motivo: 'borrado recursivo (rd /s)' },
  { re: /\bdel\s+(\/[a-z]\s+)*\/s\b/i, motivo: 'borrado recursivo (del /s)' },
  { re: /\bgit\s+push\b[^|;&]*(\s--force\b|\s-f\b|\s--force-with-lease\b)/i, motivo: 'git push forzado' },
  { re: /\bgit\s+reset\s+--hard\b/i, motivo: 'git reset --hard (pierde cambios)' },
  { re: /\bgit\s+clean\s+-[a-z]*f/i, motivo: 'git clean -f (borra archivos no versionados)' },
  { re: /(^|[\s;&|])sudo\s/i, motivo: 'ejecución con privilegios (sudo)' },
  { re: /\b(mkfs|diskpart|format\s+[a-z]:)/i, motivo: 'formateo de discos' },
  { re: /\bdd\s+if=/i, motivo: 'escritura de bajo nivel en disco (dd)' },
  { re: /\b(shutdown|reboot)\b/i, motivo: 'apagado o reinicio del equipo' },
  { re: /\b(curl|wget|iwr|Invoke-WebRequest)\b[^;&]*\|\s*(ba|z)?sh\b/i, motivo: 'ejecutar un script descargado de internet' },
  { re: /\b(iex|Invoke-Expression)\b/i, motivo: 'ejecución dinámica de código (Invoke-Expression)' },
  { re: /\bchmod\s+-R\s+777\b/i, motivo: 'permisos 777 recursivos' },
  { re: /\b(reg\s+(add|delete)|Set-ExecutionPolicy|netsh|bcdedit)\b/i, motivo: 'cambio de configuración del sistema operativo' },
];

/** Busca en un comando referencias a archivos secretos (cat .env, type id_rsa, etc.). */
function comandoTocaSecreto(cmd) {
  const tokens = cmd.split(/[\s"'`;&|<>()]+/).filter(Boolean);
  for (const t of tokens) {
    const motivo = esSecreto(t);
    if (motivo) return motivo;
  }
  return null;
}

/** Detecta redirecciones que truncan archivos de memoria: `> memoria/x.md`. */
function truncaMemoria(cmd) {
  return /(^|[^>])>\s*["']?(\.\/)?memoria\//i.test(cmd);
}

/**
 * Detecta borrado (rm/del/Remove-Item…) que apunta a memoria/.
 * La orden de borrado debe estar en posición de comando (inicio, o tras ; & | salto de línea,
 * paréntesis, $( o comilla invertida), opcionalmente precedida de sudo, git o xargs.
 * Así no se confunde con la preposición "del" dentro de un texto ("copia del modelo y la memoria").
 */
const BORRADO_MEMORIA = new RegExp(
  String.raw`(^|[;&|\n(` + '`' + String.raw`]|\$\()\s*(sudo\s+)?(git\s+|xargs\s+(-\S+\s+)*)?` +
  String.raw`(rm|del|erase|Remove-Item|ri|rmdir|rd)(\s|$)[^;&|\n]*\bmemoria\b`,
  'i',
);
function borraMemoria(cmd) {
  return BORRADO_MEMORIA.test(cmd);
}

export function evaluar(entrada, dirProyecto) {
  const herramienta = entrada?.tool_name || '';
  const params = entrada?.tool_input || {};
  const permitir = { decision: 'allow', motivo: '' };

  // --- Herramientas de archivos ---------------------------------------------
  if (['Read', 'Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(herramienta)) {
    const ruta = params.file_path || params.notebook_path || '';
    const secreto = esSecreto(ruta);
    if (secreto) {
      return { decision: 'deny', motivo: `Bloqueado por seguridad: ${secreto} (${ruta}). VITIDEV IA OS no lee ni modifica secretos.` };
    }

    if (herramienta !== 'Read' && ruta) {
      const abs = absoluta(ruta, dirProyecto);
      const dirClaude = path.join(os.homedir(), '.claude');
      if (!dentroDe(abs, dirProyecto) && !dentroDe(abs, dirClaude) && !dentroDe(abs, os.tmpdir())) {
        return { decision: 'deny', motivo: `Bloqueado: escritura fuera del proyecto (${ruta}). Pide al usuario que confirme la ruta o hazlo dentro de workspace/.` };
      }
      // Sobrescribir un archivo de memoria existente con Write reemplaza TODO su contenido.
      const memoria = path.join(dirProyecto, 'memoria');
      if (herramienta === 'Write' && dentroDe(abs, memoria) && existsSync(abs)) {
        return { decision: 'ask', motivo: `Vas a reemplazar por completo un archivo de memoria existente (${path.relative(dirProyecto, abs)}). Para cambios puntuales usa Edit. ¿Confirmas la sobrescritura?` };
      }
    }
    return permitir;
  }

  // --- Búsqueda: no buscar dentro de secretos ---------------------------------
  if (herramienta === 'Grep' || herramienta === 'Glob') {
    const secreto = esSecreto(params.path || '');
    if (secreto) return { decision: 'deny', motivo: `Bloqueado por seguridad: búsqueda en ${secreto}.` };
    return permitir;
  }

  // --- Comandos de shell ------------------------------------------------------
  if (herramienta === 'Bash' || herramienta === 'PowerShell') {
    const cmd = String(params.command || '');
    for (const { re, motivo } of COMANDOS_PROHIBIDOS) {
      if (re.test(cmd)) return { decision: 'deny', motivo: `Bloqueado por seguridad: ${motivo}. Explica al usuario qué querías hacer y busca una alternativa no destructiva (por ejemplo, mover a workspace/_archivo/).` };
    }
    const secreto = comandoTocaSecreto(cmd);
    if (secreto) return { decision: 'deny', motivo: `Bloqueado por seguridad: el comando accede a ${secreto}.` };
    if (borraMemoria(cmd)) return { decision: 'deny', motivo: 'Bloqueado: no se borran archivos de memoria/. Para eliminar un dato, usa la skill gestionar-memoria (operación Olvidar).' };
    if (truncaMemoria(cmd)) return { decision: 'deny', motivo: 'Bloqueado: la redirección ">" sobrescribiría un archivo de memoria/. Usa Edit.' };
    return permitir;
  }

  return permitir;
}
