# Limitaciones conocidas y estado de verificación

Entorno de verificación: Windows 11, Node 24, Claude Code 2.1.326 y OpenCode 1.18.32.
Última verificación: 2026-11-17, tras separar los dos ecosistemas.

## 1. Pruebas automáticas (sin modelo)

| Prueba | Resultado |
|---|---|
| `npm run validar` (ambos ecosistemas e independencia) | 0 errores |
| `npm test` (32 pruebas: validador, hooks, memoria, adaptador, plugin e independencia) | 32/32 |
| `npm run probar:opencode` con OpenCode 1.18.32 (`opencode debug`) | 8/8 |

## 2. OpenCode 1.18.32: pruebas reales con un modelo

> Estas pruebas se ejecutaron el 2026-11-16 con la arquitectura anterior (núcleo compartido,
> decisiones D13–D18). Tras la separación (D20) se ha repetido la comprobación sin modelo
> (`probar:opencode`, 8/8), pero **no** las pruebas con un modelo real.

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
| `.claude/CLAUDE.md` en una sesión **nueva** (2026-11-17) | Verificado con `claude -p`: cita la primera línea de `.claude/CLAUDE.md`, ve el perfil importado con `@../memoria/...` y confirma que `AGENTS.md` **no** está en su contexto |

## 4. Limitaciones

**L1. Recarga de configuración.** Ambas herramientas cargan agentes y configuración al iniciar.
Tras cambiar agentes, comandos, `settings.json` u `opencode.json`, abre una sesión nueva.

**L2. Los subagentes no conversan.** Devuelven un resultado y terminan; por eso `/estudiar`
imparte la clase desde el agente principal. Para una clase directa con el tutor: `claude --agent tutor`
en Claude Code. En OpenCode V1 los agentes son `subagent` y no aparecen como agente principal.

**L3. OpenCode V2 no está probado.** Según la guía oficial de migración, V2 lee el formato V1
(`permission`, frontmatter de agentes, `commands/`) y `AGENTS.md`, pero:
- los plugins de V1 **no se ejecutan**: en V2 se pierden el bloqueo en tiempo real y el resumen de
  estado; quedan las instrucciones y los permisos de `opencode.json`;
- cambia el valor por defecto de `external_directory` (VITIDEV OS AI lo fija a `ask`, así que no afecta).
Al pasar a V2 habrá que portar el plugin al nuevo formato y probarlo.

**L4. `disable-model-invocation` en OpenCode V1.** Se ignora. Por eso OpenCode no tiene skills de
comando: esos flujos son archivos de `.opencode/commands/` (D13–D18, D20).

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

**L9. Descubrimiento de skills de Claude Code.** OpenCode descubre las skills de `.claude/skills/` y
de `~/.claude/skills/` del usuario, y no hay opción en `opencode.json` para impedirlo. El agente no
puede usarlas (`permission.skill` con `"*": "deny"`), pero siguen apareciendo en
`opencode debug skill`. Para ocultarlas: `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS=1` (D20).

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
