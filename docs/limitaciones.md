# Limitaciones conocidas y estado de verificación

Entorno de verificación: Windows 11, Node 24, 2026-11-16.

## 1. Pruebas automáticas (sin modelo)

| Prueba | Resultado |
|---|---|
| `npm run validar` (ambas implementaciones) | 0 errores |
| `npm test` (30 pruebas: validador, hooks, memoria, adaptador y plugin de OpenCode, sincronización) | 30/30 |
| `npm run probar:opencode` con OpenCode 1.18.32 (`opencode debug`) | 7/7 |

## 2. OpenCode 1.18.32: pruebas reales con un modelo

Ejecutadas con `opencode run` y el modelo gratuito `opencode/deepseek-v4.1-flash-free` (sin
credenciales), sobre **copias temporales** del proyecto para no tocar la memoria real.
Los datos usados eran plantillas vacías y valores ficticios.

| # | Prueba obligatoria | Resultado | Evidencia |
|---|---|---|---|
| 1 | Reconoce `AGENTS.md` | Superada | El modelo citó literalmente su primera línea |
| 2 | Detecta las skills | Superada | `opencode debug skill` lista las 10; el modelo ve las 5 de capacidad (las 5 de comando, ocultas a propósito) |
| 3 | Carga una skill | Superada | Herramienta `skill` con `gestionar-memoria` y `aprender`: contenido devuelto |
| 4 | Reconoce los agentes | Superada | `opencode debug agent` muestra los 3 como `subagent`; `task` lanzó `project-manager` y devolvió su informe |
| 5 | Ejecuta comandos personalizados | Superada | `opencode run --command guardar …` leyó la skill y editó la memoria; `debug config` resuelve los 6 comandos |
| 6 | Consulta la memoria | Superada | Citó `estado: sin-completar` del perfil cargado por `instructions` y leyó `objetivos.md` |
| 7 | Guarda información | Superada | `/guardar` escribió "Cómo aprende mejor" en `memoria/personal/preferencias.md` |
| 8 | Conserva la memoria entre sesiones | Superada | Una sesión nueva (otro id) respondió con el dato guardado y su archivo |
| 9 | Respeta los permisos | Superada | Ver detalle abajo |
| 10 | No necesita configuración exclusiva de Claude Code | Superada | Copia sin `CLAUDE.md`, `.claude/settings.json`, `.claude/agents/` ni hooks, y con `OPENCODE_DISABLE_CLAUDE_CODE=1`: 10 skills, 3 agentes, memoria, `AGENTS.md` y estado inicial funcionando |

**Detalle de la prueba 9** (con un agente de pruebas, solo en la copia, que ejecuta órdenes sin juzgarlas):

- *Plugin activo:* bloqueados leer `.env`, leer `secrets/nota.txt`, `rm -rf`, `cat .env`,
  `Remove-Item -Recurse`, sobrescribir `memoria/objetivos.md` con `write` y `git push --force`.
  Permitidos, como debe ser, `edit` en `memoria/inbox.md` y `write` en `workspace/inbox/`.
- *Plugin desactivado (`--pure`), solo `opencode.json`:* denegados `.env` (regla `*.env`),
  `secrets/nota.txt` (`*secrets/*`, que coincide también con rutas de Windows con `\`) y `rm -rf`
  (`rm -rf *`); editar `.claude/rules/estilo.md` pidió permiso (`*.claude/*` → ask), que el modo
  sin interfaz rechaza.
- *Con el agente normal:* el modelo se negó por sí mismo a los pasos peligrosos, citando las reglas.

## 3. Claude Code: regresión

| Comprobación | Resultado |
|---|---|
| Sesión real de Claude Code abierta tras la v1.0 | Los 3 agentes aparecieron como tipos de subagente; el hook `SessionStart` inyectó el estado; el hook `PreToolUse` bloqueó en vivo `rm -rf` y `.env` |
| Lógica de los hooks tras los cambios | Pruebas de integración de `proteger.mjs` y `session-start.mjs` (28/28) |
| Skills compartidas tras normalizar sus secciones | Validador: nombres, frontmatter y secciones correctos |
| `CLAUDE.md` con `@AGENTS.md` en una sesión **nueva** | **No verificado en vivo.** `claude -p` falla porque la sesión de la CLI caducó (`claude auth login`), y la sesión de escritorio usada cargó el `CLAUDE.md` anterior. El mecanismo es el mismo `@import` que ya cargaba la memoria y que sí se verificó |

**Comprobación pendiente (1 minuto):** abre una sesión nueva de Claude Code en la carpeta y pregunta
"¿cuáles son tus reglas no negociables?". Debe responder con la sección 5 de `AGENTS.md`.

## 4. Limitaciones

**L1. Recarga de configuración.** Ambas herramientas cargan agentes y configuración al iniciar.
Tras cambiar agentes, comandos, `settings.json` u `opencode.json`, abre una sesión nueva.

**L2. Los subagentes no conversan.** Devuelven un resultado y terminan; por eso `/estudiar`
imparte la clase desde el agente principal. Para una clase directa con el tutor: `claude --agent tutor`
en Claude Code. En OpenCode V1 los agentes generados son `subagent` y no aparecen como agente principal.

**L3. OpenCode V2 no está probado.** Según la guía oficial de migración, V2 lee el formato V1
(`permission`, frontmatter de agentes, `skills.paths`, `commands/`) y `AGENTS.md`, pero:
- los plugins de V1 **no se ejecutan**: en V2 se pierden el bloqueo en tiempo real y el resumen de
  estado; quedan las instrucciones y los permisos de `opencode.json`;
- cambia el valor por defecto de `external_directory` (VITIDEV IA OS lo fija a `ask`, así que no afecta).
Al pasar a V2 habrá que portar el plugin al nuevo formato y probarlo.

**L4. `disable-model-invocation` en OpenCode V1.** Se ignora; se compensa con `permission.skill`
(D16). Consecuencia: en OpenCode las 5 skills de comando solo se usan a través de sus comandos.

**L5. El cumplimiento de las skills depende del modelo.** Son instrucciones, no código. Las
garantías duras están en los permisos y en el hook o plugin. Los modelos pequeños o gratuitos
siguen los procedimientos con menos fiabilidad.

**L6. La protección usa patrones.** Detecta los casos comunes, pero no es un sandbox: un comando
ofuscado podría escapar. No uses `--dangerously-skip-permissions` (Claude Code) ni `--auto` (OpenCode).

**L7. Sobrescribir memoria.** Claude Code pregunta; OpenCode bloquea `write` sobre un archivo de
memoria existente (un plugin no puede preguntar). Las ediciones puntuales (`edit`) se permiten en
ambas; su control depende de la regla "antes → después" de `gestionar-memoria` (L5).

**L8. El estado inicial en OpenCode usa un hook experimental** (`experimental.chat.system.transform`)
y se añade en cada turno (con datos actualizados), no una sola vez.

**L9. Skills globales del usuario.** OpenCode también carga las skills de `~/.claude/skills` del
usuario (no son de VITIDEV IA OS). Si molestan: `OPENCODE_DISABLE_CLAUDE_CODE=1`, que
VITIDEV IA OS soporta (D15).

**L10. Archivos que crea OpenCode.** Al arrancar, OpenCode instala su SDK de plugins en
`.opencode/node_modules` (requiere conexión la primera vez). Está ignorado por git. En una
ejecución de prueba, el primer arranque en una carpeta nueva se quedó sin respuesta y hubo
que repetirlo.

**L11. La memoria no es semántica.** Búsqueda por texto (grep).

**L12. Privacidad.** La memoria está en texto plano en el disco y su contenido se envía al proveedor
de IA que elijas. Con modelos gratuitos, revisa las condiciones de uso de datos del proveedor.
`.gitignore` excluye lo que creas en `memoria/aprendizajes/`, `memoria/sesiones/` y `workspace/`, pero las
plantillas de memoria siguen versionadas: revisa `git status` antes de publicar (ver [SECURITY.md](../SECURITY.md)).
Detalle en [PRIVACIDAD-Y-MEMORIA.md](PRIVACIDAD-Y-MEMORIA.md).

**L13. Rutas temporales en Windows.** La excepción de escritura en la carpeta temporal compara con
`os.tmpdir()`; si Windows usa el nombre corto 8.3 y la herramienta el largo, se bloquearía.
No afecta al uso normal.
