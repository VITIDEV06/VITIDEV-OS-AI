# Decisiones técnicas

Registro breve de las decisiones de diseño de VITIDEV OS AI v1.0, con su motivo y las
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

## D13–D18. Núcleo compartido entre herramientas (sustituidas por D20)
La primera versión compartía un núcleo entre Claude Code y OpenCode: `AGENTS.md` importado desde
`CLAUDE.md` con `@AGENTS.md`, skills leídas por OpenCode desde `.claude/skills/` (`skills.paths`),
agentes de OpenCode generados con un script de sincronización, y un plugin que reutilizaba la lógica
de `.claude/hooks/lib/`. D20 sustituye ese diseño. Siguen vigentes dos hallazgos:
- OpenCode 1.18.32 **ignora** `disable-model-invocation`: un flujo que solo debe lanzar el usuario
  se implementa en OpenCode como comando (`.opencode/commands/`), no como skill.
- Un plugin de OpenCode no puede "preguntar": la decisión "ask" de las reglas se convierte en
  bloqueo con una explicación (`.opencode/lib/adaptador.mjs`).

## D19. Sin modelo ni proveedor en el proyecto
**Decisión:** `opencode.json` no contiene `model`, `provider` ni credenciales, y los agentes no
declaran `model`. El validador lo impide.
**Motivo:** cada usuario usa su propio proveedor (incluidos los modelos gratuitos de OpenCode)
sin modificar el proyecto.

## D20. Ecosistemas independientes para Claude Code y OpenCode
**Decisión:** cada herramienta tiene sus propios archivos y ninguna referencia a la otra.
Claude Code usa solo `.claude/` (instrucciones en `.claude/CLAUDE.md`); OpenCode usa solo
`AGENTS.md`, `opencode.json` y `.opencode/` (reglas, skills, comandos, agentes, plugin y
`lib/`). Solo `memoria/` y `workspace/` son comunes, porque son datos del usuario.
**Motivo:** con un núcleo compartido, un cambio pensado para una herramienta alteraba la otra, y no
se podía adaptar una skill o una regla a las capacidades de cada una.
**Cómo se garantiza (comprobado con Claude Code 2.1 y OpenCode 1.18.32):**
- `CLAUDE.md` está en `.claude/`: Claude Code lo carga y, al existir, no lee `AGENTS.md`;
  OpenCode solo usa `CLAUDE.md` de la raíz como respaldo, así que no lo ve.
- OpenCode descubre skills en `.claude/skills/` y `~/.claude/skills/` y no hay opción en
  `opencode.json` para impedirlo. Se neutraliza con skills propias en `.opencode/skills/` (tienen
  prioridad para el mismo nombre) y una allowlist en `permission.skill` con `"*": "deny"`.
  `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS=1` evita además el descubrimiento.
- OpenCode V1 no carga `.claude/agents/` ni `.claude/commands/` (comprobado con `opencode debug`).
- `npm run validar` falla si un archivo de un ecosistema referencia al otro, y `npm test` comprueba
  que las dos copias de `reglas.mjs` aplican la misma política.
**Coste aceptado:** las skills, reglas, agentes y la lógica de protección comunes están duplicados;
una mejora hay que aplicarla en los dos lados.
**Descartado:** symlinks (poco fiables en Windows y git), imports cruzados y scripts de generación
(vuelven a acoplar los ecosistemas).
