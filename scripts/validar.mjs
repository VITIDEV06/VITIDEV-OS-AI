#!/usr/bin/env node
// Validador estructural de VITIDEV IA OS (sin dependencias).
// Uso: node scripts/validar.mjs   -> imprime el informe; código 1 si hay errores.
// También exporta validar(raiz) para las pruebas automáticas.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { desincronizados } from './sincronizar-agentes.mjs';

const HERRAMIENTAS_VALIDAS = new Set([
  'Read', 'Write', 'Edit', 'MultiEdit', 'Glob', 'Grep', 'Bash', 'WebSearch', 'WebFetch',
  'Agent', 'Task', 'TodoWrite', 'NotebookEdit', 'Skill', 'PowerShell',
]);

const OBLIGATORIOS = [
  'AGENTS.md', 'CLAUDE.md', 'README.md', 'opencode.json', '.claude/settings.json',
  '.opencode/agents', '.opencode/commands', '.opencode/plugins/vitidev.js',
  '.claude/hooks/lib/reglas.mjs', '.claude/hooks/lib/estado.mjs', '.claude/hooks/lib/opencode.mjs',
  '.claude/rules/seguridad.md', '.claude/rules/memoria.md', '.claude/rules/workspace.md', '.claude/rules/estilo.md',
  '.claude/hooks/session-start.mjs', '.claude/hooks/proteger.mjs',
  'memoria/INDICE.md', 'memoria/personal/perfil.md', 'memoria/personal/preferencias.md',
  'memoria/objetivos.md', 'memoria/proyectos/activos.md', 'memoria/proyectos/pausados.md',
  'memoria/proyectos/finalizados.md', 'memoria/aprendizajes/INDICE.md', 'memoria/inbox.md',
  'workspace/proyectos', 'workspace/universidad', 'workspace/investigaciones',
  'workspace/entregables', 'workspace/inbox', 'workspace/_archivo',
];

const SKILLS_ESPERADAS = {
  // capacidades: Claude puede invocarlas solo
  aprender: false, investigar: false, organizar: false, 'crear-proyecto': false, 'gestionar-memoria': false,
  // comandos: solo el usuario (disable-model-invocation: true)
  conocerme: true, estudiar: true, guardar: true, 'revisar-proyectos': true, 'cerrar-sesion': true,
};
const AGENTES_ESPERADOS = ['tutor', 'investigador', 'project-manager'];

const leer = (p) => readFileSync(p, 'utf8');

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

function archivosMd(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) archivosMd(p, acc);
    else if (e.name.endsWith('.md')) acc.push(p);
  }
  return acc;
}

// Rutas con marcadores de plantilla no se comprueban (AAAA-MM-DD, <slug>, *, {a,b}).
const esPlantilla = (r) => /[<>*{}]|AAAA|HH:MM|\.\.\.|…/.test(r);
// Archivos opcionales que el usuario crea si los necesita (se documentan, no se exigen).
const OPCIONALES = new Set(['.claude/settings.local.json']);
// Comandos integrados de Claude Code y OpenCode, y marcadores genéricos usados en la documentación.
const COMANDOS_AJENOS = new Set(['clear', 'help', 'agents', 'hooks', 'memory', 'permissions', 'init',
  'compact', 'config', 'status', 'doctor', 'model', 'models', 'nombre', 'comando']);

export function validar(raiz) {
  const errores = [];
  const avisos = [];
  const ok = [];
  const rel = (p) => path.relative(raiz, p).replace(/\\/g, '/');

  // 1. Estructura obligatoria
  for (const r of OBLIGATORIOS) {
    if (!existsSync(path.join(raiz, r))) errores.push(`Falta ${r}`);
  }
  ok.push(`Estructura: ${OBLIGATORIOS.length} rutas obligatorias comprobadas`);

  // 2. settings.json y hooks
  try {
    const s = JSON.parse(leer(path.join(raiz, '.claude/settings.json')));
    for (const lista of ['allow', 'ask', 'deny']) {
      for (const regla of s.permissions?.[lista] || []) {
        if (!/^[A-Za-z]+(\(.+\))?$/.test(regla)) errores.push(`settings.json: regla de permiso mal formada "${regla}"`);
      }
    }
    let nHooks = 0;
    for (const [evento, grupos] of Object.entries(s.hooks || {})) {
      for (const g of grupos) {
        for (const h of g.hooks || []) {
          nHooks++;
          const m = /\$CLAUDE_PROJECT_DIR\/([^"\s]+)/.exec(h.command || '');
          if (!m) avisos.push(`Hook ${evento}: no usa $CLAUDE_PROJECT_DIR`);
          else if (!existsSync(path.join(raiz, m[1]))) errores.push(`Hook ${evento}: no existe ${m[1]}`);
        }
      }
    }
    ok.push(`settings.json válido (${nHooks} hooks)`);
  } catch (e) {
    errores.push(`settings.json no es JSON válido: ${e.message}`);
  }

  // 3. Skills
  const dirSkills = path.join(raiz, '.claude/skills');
  const skills = existsSync(dirSkills)
    ? readdirSync(dirSkills, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : [];
  for (const nombre of Object.keys(SKILLS_ESPERADAS)) {
    if (!skills.includes(nombre)) errores.push(`Falta la skill ${nombre}`);
  }
  for (const nombre of skills) {
    const archivo = path.join(dirSkills, nombre, 'SKILL.md');
    if (!existsSync(archivo)) { errores.push(`Skill ${nombre}: falta SKILL.md`); continue; }
    const texto = leer(archivo);
    const { datos, lineas, error } = parsearFrontmatter(texto);
    if (error) { errores.push(`Skill ${nombre}: ${error}`); continue; }
    if (datos.name !== nombre) errores.push(`Skill ${nombre}: name "${datos.name}" no coincide con la carpeta`);
    if (!/^[a-z0-9-]{1,64}$/.test(datos.name || '')) errores.push(`Skill ${nombre}: name inválido (minúsculas, números y guiones, ≤64)`);
    if (!datos.description) errores.push(`Skill ${nombre}: falta description`);
    else if (datos.description.length > 1024) errores.push(`Skill ${nombre}: description > 1024 caracteres`);
    for (const p of problemasYaml(lineas)) errores.push(`Skill ${nombre}: YAML ${p}`);
    const esComando = datos['disable-model-invocation'] === 'true';
    if (nombre in SKILLS_ESPERADAS && SKILLS_ESPERADAS[nombre] !== esComando) {
      errores.push(`Skill ${nombre}: disable-model-invocation debería ser ${SKILLS_ESPERADAS[nombre]}`);
    }
    const cuerpo = texto.slice(texto.indexOf('---', 3) + 3);
    if (!esComando && !/##\s+Cuándo activarse/.test(cuerpo)) errores.push(`Skill ${nombre}: falta la sección "Cuándo activarse"`);
    for (const seccion of ['Objetivo', 'Procedimiento', 'Reglas', 'Resultado esperado']) {
      if (!new RegExp(`^##\\s+${seccion}`, 'm').test(cuerpo)) errores.push(`Skill ${nombre}: falta la sección "${seccion}"`);
    }
    if (datos['argument-hint'] && !cuerpo.includes('$ARGUMENTS')) avisos.push(`Skill ${nombre}: tiene argument-hint pero no usa $ARGUMENTS`);
  }
  ok.push(`Skills: ${skills.length} comprobadas`);

  // 4. Agentes
  const dirAgentes = path.join(raiz, '.claude/agents');
  const agentes = existsSync(dirAgentes) ? readdirSync(dirAgentes).filter((f) => f.endsWith('.md')) : [];
  for (const a of AGENTES_ESPERADOS) if (!agentes.includes(`${a}.md`)) errores.push(`Falta el agente ${a}`);
  for (const f of agentes) {
    const nombre = f.replace(/\.md$/, '');
    const texto = leer(path.join(dirAgentes, f));
    const { datos, lineas, error } = parsearFrontmatter(texto);
    if (error) { errores.push(`Agente ${nombre}: ${error}`); continue; }
    if (datos.name !== nombre) errores.push(`Agente ${nombre}: name "${datos.name}" no coincide con el archivo`);
    if (!datos.description) errores.push(`Agente ${nombre}: falta description`);
    for (const p of problemasYaml(lineas)) errores.push(`Agente ${nombre}: YAML ${p}`);
    for (const t of (datos.tools || '').split(',').map((x) => x.trim()).filter(Boolean)) {
      if (!HERRAMIENTAS_VALIDAS.has(t)) errores.push(`Agente ${nombre}: herramienta desconocida "${t}"`);
    }
    if (/\b(Write|Edit|Bash)\b/.test(datos.tools || '')) avisos.push(`Agente ${nombre}: tiene herramientas de escritura/ejecución`);
    if (texto.slice(texto.indexOf('---', 3) + 3).trim().length < 200) errores.push(`Agente ${nombre}: instrucciones demasiado cortas`);
  }
  ok.push(`Agentes: ${agentes.length} comprobados`);

  // 5. Imports @ de CLAUDE.md
  const claude = existsSync(path.join(raiz, 'CLAUDE.md')) ? leer(path.join(raiz, 'CLAUDE.md')) : '';
  const imports = [...claude.matchAll(/^@(\S+)/gm)].map((m) => m[1]);
  for (const i of imports) if (!existsSync(path.join(raiz, i))) errores.push(`CLAUDE.md importa @${i}, que no existe`);
  if (!imports.includes('AGENTS.md')) errores.push('CLAUDE.md no importa @AGENTS.md (fuente única de instrucciones)');
  ok.push(`CLAUDE.md: ${imports.length} imports comprobados`);

  // 5b. OpenCode: opencode.json, agentes, comandos y plugin
  validarOpenCode(raiz, { errores, avisos, ok, skills, imports });

  // 6. Referencias en Markdown: enlaces relativos, rutas entre comillas invertidas,
  //    skills y agentes mencionados.
  const md = archivosMd(raiz);
  let nRefs = 0;
  for (const f of md) {
    const texto = leer(f);
    // Enlaces [texto](ruta)
    for (const m of texto.matchAll(/\]\(([^)\s]+)\)/g)) {
      const destino = m[1].split('#')[0];
      if (!destino || /^(https?:|mailto:)/.test(destino) || esPlantilla(destino)) continue;
      nRefs++;
      const abs = path.resolve(path.dirname(f), destino);
      if (!existsSync(abs)) errores.push(`${rel(f)}: enlace roto → ${m[1]}`);
    }
    // Rutas del proyecto entre comillas invertidas: `memoria/...`, `.claude/...`, `workspace/...`
    for (const m of texto.matchAll(/`((?:\.claude|memoria|workspace|scripts|tests|docs)\/[^`\s]*)`/g)) {
      const r = m[1];
      if (esPlantilla(r) || OPCIONALES.has(r)) continue;
      nRefs++;
      if (!existsSync(path.join(raiz, r))) errores.push(`${rel(f)}: ruta inexistente → ${r}`);
    }
    // Skills mencionadas: "skill `x`"
    for (const m of texto.matchAll(/skill\s+`([a-z0-9-]+)`/gi)) {
      nRefs++;
      if (!skills.includes(m[1])) errores.push(`${rel(f)}: menciona la skill inexistente ${m[1]}`);
    }
    // Agentes mencionados: subagent_type: x  /  agente `x`
    for (const m of texto.matchAll(/(?:subagent_type:\s*|agente\s+`)([a-z0-9-]+)/gi)) {
      nRefs++;
      if (!agentes.includes(`${m[1]}.md`)) errores.push(`${rel(f)}: menciona el agente inexistente ${m[1]}`);
    }
    // Comandos /x mencionados entre comillas invertidas
    for (const m of texto.matchAll(/`\/([a-z][a-z0-9-]+)(?:\s[^`]*)?`/g)) {
      if (COMANDOS_AJENOS.has(m[1])) continue;
      nRefs++;
      if (!skills.includes(m[1])) errores.push(`${rel(f)}: menciona el comando inexistente /${m[1]}`);
    }
  }
  ok.push(`Referencias: ${nRefs} comprobadas en ${md.length} archivos Markdown`);

  // 7. Memoria: frontmatter con tipo
  const dirMem = path.join(raiz, 'memoria');
  for (const f of archivosMd(dirMem)) {
    const r = rel(f);
    if (r.endsWith('README.md') || r === 'memoria/INDICE.md') continue;
    const { datos, error } = parsearFrontmatter(leer(f));
    if (error) errores.push(`${r}: ${error}`);
    else if (!datos.tipo) errores.push(`${r}: falta "tipo" en el frontmatter`);
  }
  ok.push('Memoria: frontmatter comprobado');

  return { errores, avisos, ok };
}

// --- OpenCode -----------------------------------------------------------------
const CLAVES_PROHIBIDAS = ['model', 'small_model', 'provider', 'providers', 'enabled_providers'];
const PATRON_SECRETO = /(api[_-]?key|token|secret|password|bearer)/i;

function validarOpenCode(raiz, { errores, ok, skills, imports }) {
  const archivo = path.join(raiz, 'opencode.json');
  if (!existsSync(archivo)) return;
  let cfg;
  try { cfg = JSON.parse(leer(archivo)); } catch (e) { errores.push(`opencode.json no es JSON válido: ${e.message}`); return; }

  if (cfg.$schema !== 'https://opencode.ai/config.json') errores.push('opencode.json: falta "$schema": "https://opencode.ai/config.json"');
  for (const k of CLAVES_PROHIBIDAS) {
    if (k in cfg) errores.push(`opencode.json: no fijes "${k}" (cada usuario elige su proveedor y modelo)`);
  }
  // Sin credenciales en ninguna clave ni valor
  const texto = JSON.stringify(cfg);
  for (const m of texto.matchAll(/"([^"]+)":\s*"([^"]*)"/g)) {
    const esReglaDePermiso = ['allow', 'ask', 'deny'].includes(m[2]);
    if ((PATRON_SECRETO.test(m[1]) && !esReglaDePermiso) || /^(sk-|ghp_|xox)/.test(m[2])) {
      errores.push(`opencode.json: posible credencial en "${m[1]}"`);
    }
  }

  // instructions: existen y la memoria coincide con los imports de CLAUDE.md
  const instr = cfg.instructions || [];
  for (const i of instr) if (!/[*?]/.test(i) && !existsSync(path.join(raiz, i))) errores.push(`opencode.json: instructions apunta a ${i}, que no existe`);
  const memOC = instr.filter((i) => i.startsWith('memoria/')).sort();
  const memCC = imports.filter((i) => i.startsWith('memoria/')).sort();
  if (JSON.stringify(memOC) !== JSON.stringify(memCC)) {
    errores.push(`La memoria cargada no coincide: CLAUDE.md [${memCC.join(', ')}] vs opencode.json [${memOC.join(', ')}]`);
  }
  for (const r of existsSync(path.join(raiz, '.claude/rules')) ? readdirSync(path.join(raiz, '.claude/rules')) : []) {
    if (!instr.includes(`.claude/rules/${r}`)) errores.push(`opencode.json: la regla .claude/rules/${r} no está en instructions`);
  }
  for (const p of cfg.skills?.paths || []) if (!existsSync(path.join(raiz, p))) errores.push(`opencode.json: skills.paths ${p} no existe`);

  // Las skills de comando se ocultan al modelo con permission.skill = deny
  const permSkill = cfg.permission?.skill || {};
  for (const [nombre, esComando] of Object.entries(SKILLS_ESPERADAS)) {
    if (esComando && permSkill[nombre] !== 'deny') errores.push(`opencode.json: permission.skill.${nombre} debe ser "deny" (skill de comando)`);
    if (!esComando && permSkill[nombre] === 'deny') errores.push(`opencode.json: la skill de capacidad ${nombre} no debe estar denegada`);
  }
  const permRead = cfg.permission?.read || {};
  for (const p of ['*.env', '*.env.*', '*.pem', '*.key']) if (permRead[p] !== 'deny') errores.push(`opencode.json: permission.read["${p}"] debe ser "deny"`);
  ok.push('opencode.json válido (sin modelo ni credenciales; memoria y reglas coherentes con Claude Code)');

  // Sin duplicar skills en .opencode/skills
  const dirOSk = path.join(raiz, '.opencode/skills');
  if (existsSync(dirOSk)) {
    for (const s of readdirSync(dirOSk)) if (skills.includes(s)) errores.push(`.opencode/skills/${s} duplica el id de .claude/skills/${s}`);
  }

  // Agentes generados y sincronizados
  for (const rel of desincronizados(raiz)) errores.push(`${rel} no está sincronizado con .claude/agents (ejecuta: npm run sincronizar)`);
  const dirOAg = path.join(raiz, '.opencode/agents');
  const agOC = existsSync(dirOAg) ? readdirSync(dirOAg).filter((f) => f.endsWith('.md')) : [];
  for (const f of agOC) {
    const { datos, error } = parsearFrontmatter(leer(path.join(dirOAg, f)));
    if (error) { errores.push(`.opencode/agents/${f}: ${error}`); continue; }
    if (datos.mode !== 'subagent') errores.push(`.opencode/agents/${f}: mode debe ser subagent`);
    if ('model' in datos) errores.push(`.opencode/agents/${f}: no fijes model (hereda el de la sesión)`);
    if (!datos.description) errores.push(`.opencode/agents/${f}: falta description`);
  }
  ok.push(`OpenCode: ${agOC.length} agentes sincronizados`);

  // Comandos: uno por skill de comando + investigar; cada uno usa su skill y $ARGUMENTS
  const dirCmd = path.join(raiz, '.opencode/commands');
  const cmds = existsSync(dirCmd) ? readdirSync(dirCmd).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')) : [];
  const esperados = [...Object.keys(SKILLS_ESPERADAS).filter((k) => SKILLS_ESPERADAS[k]), 'investigar'];
  for (const c of esperados) if (!cmds.includes(c)) errores.push(`Falta el comando de OpenCode .opencode/commands/${c}.md`);
  for (const c of cmds) {
    const t = leer(path.join(dirCmd, `${c}.md`));
    const { datos, error } = parsearFrontmatter(t);
    if (error) { errores.push(`.opencode/commands/${c}.md: ${error}`); continue; }
    if (!datos.description) errores.push(`.opencode/commands/${c}.md: falta description`);
    if ('model' in datos) errores.push(`.opencode/commands/${c}.md: no fijes model`);
    if (!t.includes('$ARGUMENTS')) errores.push(`.opencode/commands/${c}.md: no pasa $ARGUMENTS`);
    if (!skills.includes(c)) errores.push(`.opencode/commands/${c}.md: no existe la skill ${c} que debería usar`);
    else if (!t.includes(`skill \`${c}\``)) errores.push(`.opencode/commands/${c}.md: no menciona la skill \`${c}\``);
  }
  ok.push(`OpenCode: ${cmds.length} comandos comprobados`);

  // Plugin: OpenCode trata cada export como plugin, así que solo debe haber export default
  const plugin = path.join(raiz, '.opencode/plugins/vitidev.js');
  if (existsSync(plugin)) {
    const p = leer(plugin);
    if (!/export default/.test(p)) errores.push('.opencode/plugins/vitidev.js: falta export default');
    if (/^export\s+(?!default)/m.test(p)) errores.push('.opencode/plugins/vitidev.js: solo debe tener export default');
  }
}

// --- CLI ----------------------------------------------------------------------
const esPrincipal = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (esPrincipal) {
  const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const { errores, avisos, ok } = validar(raiz);
  console.log('VITIDEV IA OS — validación estructural\n');
  for (const o of ok) console.log(`  ✔ ${o}`);
  for (const a of avisos) console.log(`  ⚠ ${a}`);
  for (const e of errores) console.log(`  ✖ ${e}`);
  console.log(`\n${errores.length} error(es), ${avisos.length} aviso(s).`);
  process.exit(errores.length ? 1 : 0);
}
