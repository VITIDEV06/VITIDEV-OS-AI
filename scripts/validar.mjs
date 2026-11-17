#!/usr/bin/env node
// Validador estructural de VITIDEV OS AI (sin dependencias).
// Comprueba cada ecosistema por separado (Claude Code y OpenCode) y que ninguno
// dependa de los recursos del otro.
// Uso: node scripts/validar.mjs   -> imprime el informe; código 1 si hay errores.
// También exporta validar(raiz) para las pruebas automáticas.

import { readFileSync, readdirSync, existsSync, lstatSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERRAMIENTAS_CLAUDE = new Set([
  'Read', 'Write', 'Edit', 'MultiEdit', 'Glob', 'Grep', 'Bash', 'WebSearch', 'WebFetch',
  'Agent', 'Task', 'TodoWrite', 'NotebookEdit', 'Skill', 'PowerShell',
]);

const OBLIGATORIOS = [
  'README.md',
  // Claude Code
  '.claude/CLAUDE.md', '.claude/settings.json',
  '.claude/rules/seguridad.md', '.claude/rules/memoria.md', '.claude/rules/workspace.md', '.claude/rules/estilo.md',
  '.claude/hooks/session-start.mjs', '.claude/hooks/proteger.mjs',
  '.claude/hooks/lib/reglas.mjs', '.claude/hooks/lib/estado.mjs',
  // OpenCode
  'AGENTS.md', 'opencode.json', '.opencode/plugins/vitidev.js',
  '.opencode/lib/reglas.mjs', '.opencode/lib/estado.mjs', '.opencode/lib/adaptador.mjs',
  '.opencode/rules/seguridad.md', '.opencode/rules/memoria.md', '.opencode/rules/workspace.md', '.opencode/rules/estilo.md',
  // Datos del usuario (compartidos a propósito)
  'memoria/INDICE.md', 'memoria/personal/perfil.md', 'memoria/personal/preferencias.md',
  'memoria/objetivos.md', 'memoria/proyectos/activos.md', 'memoria/proyectos/pausados.md',
  'memoria/proyectos/finalizados.md', 'memoria/aprendizajes/INDICE.md', 'memoria/inbox.md',
  'workspace/proyectos', 'workspace/universidad', 'workspace/investigaciones',
  'workspace/entregables', 'workspace/inbox', 'workspace/_archivo',
];

// Claude Code: true = skill de comando (disable-model-invocation: true)
const SKILLS_CLAUDE = {
  aprender: false, investigar: false, organizar: false, 'crear-proyecto': false, 'gestionar-memoria': false,
  conocerme: true, estudiar: true, guardar: true, 'revisar-proyectos': true, 'cerrar-sesion': true,
};
// OpenCode: skills de capacidad (los flujos de usuario son comandos de .opencode/commands)
const SKILLS_OPENCODE = ['aprender', 'investigar', 'organizar', 'crear-proyecto', 'gestionar-memoria'];
const COMANDOS_OPENCODE = ['conocerme', 'estudiar', 'investigar', 'guardar', 'revisar-proyectos', 'cerrar-sesion'];
const AGENTES = ['tutor', 'investigador', 'project-manager'];

const leer = (p) => readFileSync(p, 'utf8');
const listar = (dir, filtro = () => true) => (existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter(filtro) : []);

/** Parser de frontmatter plano. Devuelve { datos, lineas, error }. */
export function parsearFrontmatter(texto) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/.exec(texto);
  if (!m) return { datos: null, lineas: [], error: 'sin frontmatter YAML (--- … ---)' };
  const datos = {};
  const lineas = m[1].split(/\r?\n/);
  for (const l of lineas) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(l);
    if (kv) datos[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1').trim();
  }
  return { datos, lineas, error: null };
}

/** Detecta valores YAML sin comillas que un parser real interpretaría mal. */
function problemasYaml(lineas) {
  const errores = [];
  for (const l of lineas) {
    const kv = /^([\w-]+):\s+(.*)$/.exec(l);
    if (!kv) continue;
    const v = kv[2];
    if (/^["'[{]/.test(v) || v === '') continue;
    if (/:\s/.test(v)) errores.push(`"${kv[1]}" contiene ": " sin comillas`);
    if (/\s#/.test(v)) errores.push(`"${kv[1]}" contiene " #" (comentario YAML) sin comillas`);
    if (/^[>|*&!%@`]/.test(v)) errores.push(`"${kv[1]}" empieza por un carácter reservado de YAML`);
  }
  return errores;
}

const IGNORAR = new Set(['node_modules', '.git', 'package.json', 'package-lock.json', 'bun.lock', '.gitignore']);
function archivos(dir, ext, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORAR.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) archivos(p, ext, acc);
    else if (ext.some((x) => e.name.endsWith(x))) acc.push(p);
  }
  return acc;
}

// Rutas con marcadores de plantilla no se comprueban (AAAA-MM-DD, <slug>, *, {a,b}).
const esPlantilla = (r) => /[<>*{}]|AAAA|HH:MM|\.\.\.|…/.test(r);
// Archivos opcionales que el usuario crea si los necesita, y rutas oficiales que el proyecto
// menciona pero no usa (se documentan, no se exigen).
const OPCIONALES = new Set(['.claude/settings.local.json', '.claude/commands/']);
// Comandos integrados de Claude Code y OpenCode, y marcadores genéricos usados en la documentación.
const COMANDOS_AJENOS = new Set(['clear', 'help', 'agents', 'hooks', 'memory', 'permissions', 'init',
  'compact', 'config', 'status', 'doctor', 'model', 'models', 'nombre', 'comando']);

/** Comprueba una carpeta de skills con el formato SKILL.md. Devuelve los ids encontrados. */
function validarSkills(raiz, dirRel, esperadas, errores, avisos) {
  const dir = path.join(raiz, dirRel);
  const ids = listar(dir, (e) => e.isDirectory()).map((e) => e.name);
  for (const nombre of Object.keys(esperadas)) if (!ids.includes(nombre)) errores.push(`Falta la skill ${dirRel}/${nombre}`);
  for (const nombre of ids) {
    const archivo = path.join(dir, nombre, 'SKILL.md');
    const id = `${dirRel}/${nombre}`;
    if (lstatSync(path.join(dir, nombre)).isSymbolicLink()) errores.push(`${id}: es un enlace simbólico; cada ecosistema necesita su propia copia`);
    if (!existsSync(archivo)) { errores.push(`${id}: falta SKILL.md`); continue; }
    const texto = leer(archivo);
    const { datos, lineas, error } = parsearFrontmatter(texto);
    if (error) { errores.push(`${id}: ${error}`); continue; }
    if (datos.name !== nombre) errores.push(`Skill ${id}: name "${datos.name}" no coincide con la carpeta`);
    if (!/^[a-z0-9-]{1,64}$/.test(datos.name || '')) errores.push(`Skill ${id}: name inválido (minúsculas, números y guiones, ≤64)`);
    if (!datos.description) errores.push(`Skill ${id}: falta description`);
    else if (datos.description.length > 1024) errores.push(`Skill ${id}: description > 1024 caracteres`);
    for (const p of problemasYaml(lineas)) errores.push(`Skill ${id}: YAML ${p}`);
    const esComando = datos['disable-model-invocation'] === 'true';
    if (nombre in esperadas && esperadas[nombre] !== esComando) {
      errores.push(`Skill ${id}: disable-model-invocation debería ser ${esperadas[nombre]}`);
    }
    const cuerpo = texto.slice(texto.indexOf('---', 3) + 3);
    if (!esComando && !/##\s+Cuándo activarse/.test(cuerpo)) errores.push(`Skill ${id}: falta la sección "Cuándo activarse"`);
    for (const seccion of ['Objetivo', 'Procedimiento', 'Reglas', 'Resultado esperado']) {
      if (!new RegExp(`^##\\s+${seccion}`, 'm').test(cuerpo)) errores.push(`Skill ${id}: falta la sección "${seccion}"`);
    }
    if (datos['argument-hint'] && !cuerpo.includes('$ARGUMENTS')) avisos.push(`Skill ${id}: tiene argument-hint pero no usa $ARGUMENTS`);
  }
  return ids;
}

export function validar(raiz) {
  const errores = [];
  const avisos = [];
  const ok = [];
  const rel = (p) => path.relative(raiz, p).replace(/\\/g, '/');

  // 1. Estructura obligatoria
  for (const r of OBLIGATORIOS) if (!existsSync(path.join(raiz, r))) errores.push(`Falta ${r}`);
  if (existsSync(path.join(raiz, 'CLAUDE.md'))) {
    errores.push('CLAUDE.md en la raíz: las instrucciones de Claude Code van en .claude/CLAUDE.md (OpenCode usaría el de la raíz como respaldo de AGENTS.md)');
  }
  ok.push(`Estructura: ${OBLIGATORIOS.length} rutas obligatorias comprobadas`);

  // 2. Ecosistema Claude Code
  const skillsClaude = validarSkills(raiz, '.claude/skills', SKILLS_CLAUDE, errores, avisos);
  const agentesClaude = validarAgentesClaude(raiz, errores, avisos);
  validarSettingsClaude(raiz, errores, avisos);
  const claudeMd = path.join(raiz, '.claude/CLAUDE.md');
  const imports = existsSync(claudeMd) ? [...leer(claudeMd).matchAll(/^@(\S+)/gm)].map((m) => m[1]) : [];
  for (const i of imports) {
    if (!existsSync(path.resolve(path.dirname(claudeMd), i))) errores.push(`.claude/CLAUDE.md importa @${i}, que no existe`);
    if (/AGENTS\.md$/.test(i)) errores.push('.claude/CLAUDE.md importa AGENTS.md: son las instrucciones de OpenCode');
  }
  ok.push(`Claude Code: ${skillsClaude.length} skills, ${agentesClaude.length} agentes, ${imports.length} imports en .claude/CLAUDE.md`);

  // 3. Ecosistema OpenCode
  const skillsOC = validarSkills(raiz, '.opencode/skills', Object.fromEntries(SKILLS_OPENCODE.map((s) => [s, false])), errores, avisos);
  const { comandos, agentes: agentesOC } = validarOpenCode(raiz, skillsOC, errores);
  ok.push(`OpenCode: ${skillsOC.length} skills, ${comandos.length} comandos, ${agentesOC.length} agentes`);

  // 4. Independencia entre ecosistemas
  validarIndependencia(raiz, rel, errores);
  ok.push('Independencia: ningún ecosistema carga ni importa recursos del otro');

  // 5. Referencias en Markdown: enlaces relativos, rutas, skills, agentes y comandos mencionados.
  const md = archivos(raiz, ['.md']);
  const enCarpeta = (f, c) => rel(f).startsWith(`${c}/`) || (c === '.opencode' && rel(f) === 'AGENTS.md');
  let nRefs = 0;
  for (const f of md) {
    const texto = leer(f);
    const deClaude = enCarpeta(f, '.claude');
    const deOpenCode = enCarpeta(f, '.opencode');
    const skillsValidas = deClaude ? skillsClaude : deOpenCode ? skillsOC : [...skillsClaude, ...skillsOC];
    const comandosValidos = deClaude ? skillsClaude : deOpenCode ? comandos : [...skillsClaude, ...comandos];
    const agentesValidos = deClaude ? agentesClaude : deOpenCode ? agentesOC : [...agentesClaude, ...agentesOC];
    for (const m of texto.matchAll(/\]\(([^)\s]+)\)/g)) {
      const destino = m[1].split('#')[0];
      if (!destino || /^(https?:|mailto:)/.test(destino) || esPlantilla(destino)) continue;
      nRefs++;
      if (!existsSync(path.resolve(path.dirname(f), destino))) errores.push(`${rel(f)}: enlace roto → ${m[1]}`);
    }
    // El CHANGELOG es historial: puede nombrar rutas que ya no existen.
    for (const m of rel(f) === 'CHANGELOG.md' ? [] : texto.matchAll(/`((?:\.claude|\.opencode|memoria|workspace|scripts|tests|docs)\/[^`\s]*)`/g)) {
      const r = m[1];
      // node_modules lo genera OpenCode al arrancar: puede no existir.
      if (esPlantilla(r) || OPCIONALES.has(r) || r.includes('node_modules')) continue;
      nRefs++;
      if (!existsSync(path.join(raiz, r))) errores.push(`${rel(f)}: ruta inexistente → ${r}`);
    }
    for (const m of texto.matchAll(/skill\s+`([a-z0-9-]+)`/gi)) {
      nRefs++;
      if (!skillsValidas.includes(m[1])) errores.push(`${rel(f)}: menciona la skill inexistente ${m[1]}`);
    }
    for (const m of texto.matchAll(/(?:subagent_type:\s*|agente\s+`)([a-z0-9-]+)/gi)) {
      nRefs++;
      if (!agentesValidos.includes(m[1])) errores.push(`${rel(f)}: menciona el agente inexistente ${m[1]}`);
    }
    for (const m of texto.matchAll(/`\/([a-z][a-z0-9-]+)(?:\s[^`]*)?`/g)) {
      if (COMANDOS_AJENOS.has(m[1])) continue;
      nRefs++;
      if (!comandosValidos.includes(m[1])) errores.push(`${rel(f)}: menciona el comando inexistente /${m[1]}`);
    }
  }
  ok.push(`Referencias: ${nRefs} comprobadas en ${md.length} archivos Markdown`);

  // 6. Memoria: frontmatter con tipo
  for (const f of archivos(path.join(raiz, 'memoria'), ['.md'])) {
    const r = rel(f);
    if (r.endsWith('README.md') || r === 'memoria/INDICE.md') continue;
    const { datos, error } = parsearFrontmatter(leer(f));
    if (error) errores.push(`${r}: ${error}`);
    else if (!datos.tipo) errores.push(`${r}: falta "tipo" en el frontmatter`);
  }
  ok.push('Memoria: frontmatter comprobado');

  return { errores, avisos, ok };
}

// --- Claude Code ---------------------------------------------------------------

function validarAgentesClaude(raiz, errores, avisos) {
  const dir = path.join(raiz, '.claude/agents');
  const nombres = [];
  for (const e of listar(dir, (x) => x.name.endsWith('.md'))) {
    const nombre = e.name.replace(/\.md$/, '');
    nombres.push(nombre);
    const texto = leer(path.join(dir, e.name));
    const { datos, lineas, error } = parsearFrontmatter(texto);
    if (error) { errores.push(`Agente .claude/agents/${nombre}: ${error}`); continue; }
    if (datos.name !== nombre) errores.push(`Agente ${nombre}: name "${datos.name}" no coincide con el archivo`);
    if (!datos.description) errores.push(`Agente ${nombre}: falta description`);
    for (const p of problemasYaml(lineas)) errores.push(`Agente ${nombre}: YAML ${p}`);
    for (const t of (datos.tools || '').split(',').map((x) => x.trim()).filter(Boolean)) {
      if (!HERRAMIENTAS_CLAUDE.has(t)) errores.push(`Agente ${nombre}: herramienta desconocida "${t}"`);
    }
    if (/\b(Write|Edit|Bash)\b/.test(datos.tools || '')) avisos.push(`Agente ${nombre}: tiene herramientas de escritura/ejecución`);
    if (texto.slice(texto.indexOf('---', 3) + 3).trim().length < 200) errores.push(`Agente ${nombre}: instrucciones demasiado cortas`);
  }
  for (const a of AGENTES) if (!nombres.includes(a)) errores.push(`Falta el agente .claude/agents/${a}.md`);
  return nombres;
}

function validarSettingsClaude(raiz, errores, avisos) {
  try {
    const s = JSON.parse(leer(path.join(raiz, '.claude/settings.json')));
    for (const lista of ['allow', 'ask', 'deny']) {
      for (const regla of s.permissions?.[lista] || []) {
        if (!/^[A-Za-z]+(\(.+\))?$/.test(regla)) errores.push(`settings.json: regla de permiso mal formada "${regla}"`);
      }
    }
    for (const [evento, grupos] of Object.entries(s.hooks || {})) {
      for (const g of grupos) {
        for (const h of g.hooks || []) {
          const m = /\$CLAUDE_PROJECT_DIR\/([^"\s]+)/.exec(h.command || '');
          if (!m) avisos.push(`Hook ${evento}: no usa $CLAUDE_PROJECT_DIR`);
          else if (!existsSync(path.join(raiz, m[1]))) errores.push(`Hook ${evento}: no existe ${m[1]}`);
          else if (!m[1].startsWith('.claude/')) errores.push(`Hook ${evento}: ${m[1]} está fuera de .claude/`);
        }
      }
    }
  } catch (e) {
    errores.push(`.claude/settings.json no es JSON válido: ${e.message}`);
  }
}

// --- OpenCode ------------------------------------------------------------------
const CLAVES_PROHIBIDAS = ['model', 'small_model', 'provider', 'providers', 'enabled_providers'];
const PATRON_SECRETO = /(api[_-]?key|token|secret|password|bearer)/i;

function validarOpenCode(raiz, skillsOC, errores) {
  const resultado = { comandos: [], agentes: [] };
  const archivo = path.join(raiz, 'opencode.json');
  let cfg = {};
  try { cfg = JSON.parse(leer(archivo)); } catch (e) { errores.push(`opencode.json no es JSON válido: ${e.message}`); }

  if (cfg.$schema !== 'https://opencode.ai/config.json') errores.push('opencode.json: falta "$schema": "https://opencode.ai/config.json"');
  for (const k of CLAVES_PROHIBIDAS) if (k in cfg) errores.push(`opencode.json: no fijes "${k}" (cada usuario elige su proveedor y modelo)`);
  for (const m of JSON.stringify(cfg).matchAll(/"([^"]+)":\s*"([^"]*)"/g)) {
    const esReglaDePermiso = ['allow', 'ask', 'deny'].includes(m[2]);
    if ((PATRON_SECRETO.test(m[1]) && !esReglaDePermiso) || /^(sk-|ghp_|xox)/.test(m[2])) {
      errores.push(`opencode.json: posible credencial en "${m[1]}"`);
    }
  }
  for (const i of cfg.instructions || []) {
    if (!/[*?]/.test(i) && !/^https?:/.test(i) && !existsSync(path.join(raiz, i))) errores.push(`opencode.json: instructions apunta a ${i}, que no existe`);
  }
  for (const r of listar(path.join(raiz, '.opencode/rules'), (e) => e.name.endsWith('.md'))) {
    if (!(cfg.instructions || []).includes(`.opencode/rules/${r.name}`)) errores.push(`opencode.json: la regla .opencode/rules/${r.name} no está en instructions`);
  }

  // Skills: OpenCode también descubre .claude/skills, así que se deniegan todas por defecto
  // y solo se permiten las propias de .opencode/skills (que tienen prioridad por id).
  const permSkill = cfg.permission?.skill;
  if (typeof permSkill !== 'object' || permSkill['*'] !== 'deny') {
    errores.push('opencode.json: permission.skill debe empezar por "*": "deny" (evita cargar skills de .claude/skills)');
  } else {
    for (const s of skillsOC) if (permSkill[s] !== 'allow') errores.push(`opencode.json: permission.skill.${s} debe ser "allow" (skill propia de .opencode/skills)`);
    for (const [s, v] of Object.entries(permSkill)) {
      if (s !== '*' && v !== 'deny' && !skillsOC.includes(s)) errores.push(`opencode.json: permission.skill permite "${s}", que no existe en .opencode/skills`);
    }
  }
  const permRead = cfg.permission?.read || {};
  for (const p of ['*.env', '*.env.*', '*.pem', '*.key']) if (permRead[p] !== 'deny') errores.push(`opencode.json: permission.read["${p}"] debe ser "deny"`);

  // Agentes
  const dirAg = path.join(raiz, '.opencode/agents');
  for (const e of listar(dirAg, (x) => x.name.endsWith('.md'))) {
    const nombre = e.name.replace(/\.md$/, '');
    resultado.agentes.push(nombre);
    const texto = leer(path.join(dirAg, e.name));
    const { datos, error } = parsearFrontmatter(texto);
    if (error) { errores.push(`.opencode/agents/${e.name}: ${error}`); continue; }
    if (datos.mode !== 'subagent') errores.push(`.opencode/agents/${e.name}: mode debe ser subagent`);
    if ('model' in datos) errores.push(`.opencode/agents/${e.name}: no fijes model (hereda el de la sesión)`);
    if ('tools' in datos) errores.push(`.opencode/agents/${e.name}: usa permission, no tools (formato de Claude Code)`);
    if (!datos.description) errores.push(`.opencode/agents/${e.name}: falta description`);
    if (texto.slice(texto.indexOf('---', 3) + 3).trim().length < 200) errores.push(`.opencode/agents/${e.name}: instrucciones demasiado cortas`);
  }
  for (const a of AGENTES) if (!resultado.agentes.includes(a)) errores.push(`Falta el agente .opencode/agents/${a}.md`);

  // Comandos
  const dirCmd = path.join(raiz, '.opencode/commands');
  for (const e of listar(dirCmd, (x) => x.name.endsWith('.md'))) {
    const c = e.name.replace(/\.md$/, '');
    resultado.comandos.push(c);
    const t = leer(path.join(dirCmd, e.name));
    const { datos, error } = parsearFrontmatter(t);
    if (error) { errores.push(`.opencode/commands/${e.name}: ${error}`); continue; }
    if (!datos.description) errores.push(`.opencode/commands/${e.name}: falta description`);
    if ('model' in datos) errores.push(`.opencode/commands/${e.name}: no fijes model`);
    if (c !== 'cerrar-sesion' && !t.includes('$ARGUMENTS')) errores.push(`.opencode/commands/${e.name}: no pasa $ARGUMENTS`);
  }
  for (const c of COMANDOS_OPENCODE) if (!resultado.comandos.includes(c)) errores.push(`Falta el comando .opencode/commands/${c}.md`);

  // Plugin: OpenCode trata cada export como plugin, así que solo debe haber export default
  const plugin = path.join(raiz, '.opencode/plugins/vitidev.js');
  if (existsSync(plugin)) {
    const p = leer(plugin);
    if (!/export default/.test(p)) errores.push('.opencode/plugins/vitidev.js: falta export default');
    if (/^export\s+(?!default)/m.test(p)) errores.push('.opencode/plugins/vitidev.js: solo debe tener export default');
  }
  return resultado;
}

// --- Independencia ---------------------------------------------------------------

/**
 * Ningún archivo de un ecosistema puede apuntar a una ruta del otro.
 * - Claude Code: .claude/** (Markdown y código).
 * - OpenCode: AGENTS.md, .opencode/** y los campos de opencode.json que cargan recursos.
 * Las reglas de permisos (que protegen la configuración del otro ecosistema) no cuentan.
 */
function validarIndependencia(raiz, rel, errores) {
  const RUTA_OPENCODE = /\.opencode\/|opencode\.json|(^|[^\w.])AGENTS\.md/;
  const RUTA_CLAUDE = /\.claude\/|(^|[^\w.])CLAUDE\.md|CLAUDE_PROJECT_DIR/;
  // Claude Code no puede cargar recursos de OpenCode (imports @, rutas de código o de skills).
  for (const f of archivos(path.join(raiz, '.claude'), ['.md', '.mjs', '.js'])) {
    leer(f).split(/\r?\n/).forEach((l, i) => {
      const esImportOCodigo = /^@|\bimport\b|require\(|from\s+['"]/.test(l.trim());
      const ruta = /`[^`]*\.opencode\/[^`]*`|\.\.\/\.opencode|\.opencode\//.test(l);
      if ((esImportOCodigo && RUTA_OPENCODE.test(l)) || ruta) errores.push(`Independencia: ${rel(f)}:${i + 1} usa un recurso de OpenCode`);
    });
  }
  // OpenCode no puede cargar recursos de Claude Code.
  const deOpenCode = [path.join(raiz, 'AGENTS.md'), ...archivos(path.join(raiz, '.opencode'), ['.md', '.mjs', '.js'])];
  for (const f of deOpenCode.filter(existsSync)) {
    leer(f).split(/\r?\n/).forEach((l, i) => {
      if (RUTA_CLAUDE.test(l) && /\.claude\/|from\s+['"]|import\b|CLAUDE_PROJECT_DIR/.test(l)) {
        errores.push(`Independencia: ${rel(f)}:${i + 1} usa un recurso de Claude Code`);
      }
    });
  }
  try {
    const cfg = JSON.parse(leer(path.join(raiz, 'opencode.json')));
    const cargas = [...(cfg.instructions || []), ...(cfg.plugin || []),
      ...(Array.isArray(cfg.skills) ? cfg.skills : cfg.skills?.paths || [])];
    for (const c of cargas) if (RUTA_CLAUDE.test(String(c))) errores.push(`Independencia: opencode.json carga ${c}, que es de Claude Code`);
  } catch { /* el error de JSON ya se informa */ }
  // Ninguna skill puede ser un enlace al otro ecosistema
  for (const dir of ['.claude/skills', '.opencode/skills']) {
    for (const e of listar(path.join(raiz, dir), (x) => x.isSymbolicLink())) errores.push(`Independencia: ${dir}/${e.name} es un enlace simbólico`);
  }
}

// --- CLI ----------------------------------------------------------------------
const esPrincipal = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (esPrincipal) {
  const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const { errores, avisos, ok } = validar(raiz);
  console.log('VITIDEV OS AI — validación estructural\n');
  for (const o of ok) console.log(`  ✔ ${o}`);
  for (const a of avisos) console.log(`  ⚠ ${a}`);
  for (const e of errores) console.log(`  ✖ ${e}`);
  console.log(`\n${errores.length} error(es), ${avisos.length} aviso(s).`);
  process.exit(errores.length ? 1 : 0);
}
