# Decisiones técnicas

Registro breve de las decisiones de diseño de VITIDEV IA OS v1.0, con su motivo y las
alternativas descartadas.

## D1. Solo mecanismos nativos de cada herramienta
**Decisión:** `CLAUDE.md`, `.claude/rules/`, skills, subagentes, hooks y `settings.json`.
**Motivo:** cero instalación extra, compatible con la CLI, la app de escritorio y los IDE,
y fácil de explicar en un taller.
**Descartado:** un framework propio de agentes o un servidor MCP de memoria (más potente,
pero añade dependencias y opacidad).

## D2. Memoria en Markdown, no en una base de datos
**Decisión:** archivos `.md` con frontmatter YAML simple.
**Motivo:** el usuario puede leer y corregir su memoria con cualquier editor; git sirve de
historial; Claude lee y edita Markdown de forma nativa.
**Coste:** no hay búsqueda semántica; se usa Grep. Suficiente para memoria personal.

## D3. Carga selectiva de la memoria
**Decisión:** `CLAUDE.md` importa con `@` solo el perfil, las preferencias, los objetivos y los
proyectos activos. El resto (pausados, finalizados, aprendizajes, sesiones) se lee bajo demanda.
**Motivo:** todo lo importado ocupa contexto en cada mensaje. Lo cargado es lo mínimo
para "conocer" al usuario.

## D4. Un registro por estado de proyecto + ficha en el workspace
**Decisión:** `memoria/proyectos/{activos,pausados,finalizados}.md` (qué y en qué estado) y
`workspace/proyectos/<slug>/PROYECTO.md` (detalle y tareas).
**Motivo:** el requisito distingue explícitamente los tres estados; un archivo por estado lo
hace visible y permite cargar solo los activos. Cambiar de estado consiste en mover una sección.
**Descartado:** un único archivo con un campo `estado` (habría que cargarlo entero).

## D5. Skills de capacidad frente a skills de comando
**Decisión:** 5 skills que Claude puede activar solo (`aprender`, `investigar`, `organizar`,
`crear-proyecto`, `gestionar-memoria`) y 5 comandos con `disable-model-invocation: true`
(`conocerme`, `estudiar`, `guardar`, `revisar-proyectos`, `cerrar-sesion`).
**Motivo:** las capacidades tienen la metodología; los comandos son flujos que el usuario
decide cuándo lanzar (una entrevista o un cierre de sesión no deben activarse solos).
Los comandos **reutilizan** las capacidades en lugar de duplicarlas:
`/guardar` → `gestionar-memoria`, `/estudiar` → `aprender` + `tutor`.
`/investigar` no tiene envoltorio: la skill `investigar` ya es invocable como comando.
**Nota:** Claude Code unificó los antiguos comandos personalizados (carpeta `commands`) dentro de las skills; por eso
los comandos se implementan como skills.

## D6. Agentes de solo lectura
**Decisión:** `tutor`, `investigador` y `project-manager` no tienen Write, Edit ni Bash.
**Motivo:** un subagente no puede conversar con el usuario y, por tanto, no puede pedir
aprobación. Toda escritura pasa por el agente principal, que sí puede preguntar.
Además reduce la superficie de riesgo (por ejemplo, contenido web malicioso que intente
inducir escrituras).

## D7. Sin agente para organizar ni para la memoria
**Decisión:** solo 3 agentes.
**Motivo:** organizar y gestionar la memoria son tareas conversacionales con aprobación
paso a paso; aislarlas en un subagente no aporta nada y crearía redundancia con las skills.

## D8. Dos hooks, escritos en Node sin dependencias
**Decisión:** `SessionStart` (contexto) y `PreToolUse` (protección), en `.mjs`.
**Motivo:**
- Necesidad real 1: que el agente sepa al empezar qué está pendiente (plazos, repasos,
  próximos pasos) sin que el usuario lo pida.
- Necesidad real 2: las reglas de permisos de `settings.json` son por prefijo y no cubren
  variantes (`rm -fr`, `Remove-Item -Recurse`, `cat .env`) ni la sobrescritura completa de
  un archivo de memoria con Write.
- Node viene con Claude Code y funciona igual en Windows, macOS y Linux; Bash o PowerShell no.
- La lógica está en `lib/` como funciones puras para poder probarla con `node:test`.
**Descartado:** hooks `PostToolUse` o `Stop` para guardar memoria automáticamente: guardar
sin preguntar contradice la regla de no sobrescribir información del usuario.

## D9. Hooks que fallan "abiertos"
**Decisión:** si un hook recibe una entrada ilegible o falla, sale con código 0 (no bloquea).
**Motivo:** un error del hook no debe dejar inutilizable la sesión. La capa de permisos de
`settings.json` sigue aplicándose de forma independiente.

## D10. "Nunca borrar": `workspace/_archivo/`
**Decisión:** eliminar significa mover a `_archivo/`. Solo el usuario vacía esa carpeta.
**Motivo:** cumple "no ejecutar acciones destructivas" sin impedir la limpieza.

## D11. Validador propio en lugar de linters externos
**Decisión:** `scripts/validar.mjs` comprueba estructura, frontmatter y referencias cruzadas.
**Motivo:** sin dependencias; detecta los errores típicos al extender el sistema (nombre de
skill distinto de la carpeta, YAML con `: ` sin comillas, rutas y skills mencionadas que no
existen, herramientas de agente inventadas).

## D12. Español y `kebab-case` sin acentos
**Decisión:** contenido en español; nombres de archivos, skills y slugs sin acentos ni espacios.
**Motivo:** el público del taller es hispanohablante; los nombres sin acentos evitan
problemas de codificación entre sistemas operativos y en la línea de comandos.

## D13. Compatibilidad con OpenCode: núcleo compartido + adaptadores finos
**Decisión:** no duplicar contenido. Lo compartido (instrucciones, reglas, skills, prompts de
agentes, lógica de protección y de estado, memoria) existe una vez; cada herramienta tiene solo
un adaptador (`CLAUDE.md` + `.claude/settings.json` + hooks; `opencode.json` + `.opencode/`).
**Motivo:** dos copias divergen; con una sola, una mejora sirve a ambas herramientas.

## D14. `AGENTS.md` como fuente única de instrucciones
**Decisión:** el contenido común va en `AGENTS.md`. `CLAUDE.md` lo importa con `@AGENTS.md` y
añade solo lo propio de Claude Code.
**Comprobado en la documentación oficial (2026-11-16):**
- OpenCode V1 carga `AGENTS.md` y solo usa `CLAUDE.md` como respaldo si no hay `AGENTS.md`
  (así que no se cargan los dos). OpenCode V2 solo descubre `AGENTS.md`.
- OpenCode **no** interpreta las referencias `@archivo` dentro de `AGENTS.md`; recomienda el campo
  `instructions` de `opencode.json`. Por eso la memoria se carga con `@` en `CLAUDE.md` y con
  `instructions` en OpenCode, y el validador exige que ambas listas coincidan.
- Claude Code no lee `AGENTS.md` por sí solo; el import `@AGENTS.md` lo resuelve.
**Descartado:** generar `CLAUDE.md` desde `AGENTS.md` con un script (un paso más que olvidar)
o un enlace simbólico (poco fiable en Windows y en git).

## D15. Las skills se comparten desde `.claude/skills/`, sin copiarlas a `.opencode/skills/`
**Decisión:** OpenCode lee `.claude/skills/` de forma nativa (comprobado con `opencode debug skill`).
Además se registran en `skills.paths` de `opencode.json`.
**Motivo del registro explícito:** con `OPENCODE_DISABLE_CLAUDE_CODE=1` OpenCode deja de leer
`.claude/skills` (comprobado); el registro hace que funcionen igual. Mismo id y mismo archivo:
no hay conflicto. `.opencode/skills/` queda reservada para skills exclusivas de OpenCode,
y el validador prohíbe que repitan un id de `.claude/skills/`.
**Descartado:** copiar las skills (duplicación) o moverlas a `.agents/skills/` (Claude Code no lee esa carpeta).

## D16. Skills de comando ocultas en OpenCode mediante permisos
**Problema:** OpenCode 1.18.32 **ignora** `disable-model-invocation` (comprobado: el modelo veía
`conocerme`, `guardar`… en su lista de skills). La documentación de V2 sí lo menciona.
**Decisión:** `permission.skill` deniega las 5 skills de comando y los archivos de
`.opencode/commands/` leen su `SKILL.md` con la herramienta de lectura, sin la herramienta `skill`.
**Resultado:** mismo comportamiento que en Claude Code: solo el usuario lanza esos flujos.

## D17. Agentes de OpenCode generados, no escritos a mano
**Decisión:** `.claude/agents/*.md` es la fuente; `npm run sincronizar` genera `.opencode/agents/*.md`
copiando el cuerpo y la descripción y traduciendo `tools` a `permission` (V1):
lo que no está en `tools` queda denegado; además `task`, `skill` y `external_directory` se deniegan.
No se declara `model`: el subagente hereda el de la sesión (documentado por OpenCode).
**Motivo:** los formatos de metadatos son incompatibles (Claude: `tools`; OpenCode: `mode` y
`permission`), pero el prompt debe ser idéntico. El validador y las pruebas fallan si divergen.
**Por qué no se usan los campos de V2** (`permissions`, `steps`): OpenCode V1 no los entiende y V2
lee el formato V1 (guía oficial de migración).

## D18. Protección en OpenCode con un plugin que reutiliza `reglas.mjs`
**Decisión:** `.opencode/plugins/vitidev.js` (autodescubierto) usa `tool.execute.before` para
bloquear (lanza un error) con la misma lógica que el hook de Claude Code, a través de un
adaptador (`.claude/hooks/lib/opencode.mjs`) que traduce nombres y argumentos de herramientas.
También añade el resumen de estado con `experimental.chat.system.transform`.
**Motivo:** los permisos por patrón no cubren variantes (`Remove-Item -Recurse`, `cat .env`) ni
la sobrescritura completa de memoria. Un plugin no puede "preguntar", así que la decisión
"preguntar" de Claude Code se convierte en bloqueo con una explicación.
**Riesgo aceptado:** el hook de sistema es experimental en V1 y los plugins de V1 no se ejecutan
en V2; en ese caso quedan las capas 1 y 2 (instrucciones y `permission`).

## D19. Sin modelo ni proveedor en el proyecto
**Decisión:** `opencode.json` no contiene `model`, `provider` ni credenciales, y los agentes no
declaran `model`. El validador lo impide.
**Motivo:** cada usuario usa su propio proveedor (incluidos los modelos gratuitos de OpenCode)
sin modificar el proyecto.
