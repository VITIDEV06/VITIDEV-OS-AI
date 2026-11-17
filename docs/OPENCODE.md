# OpenCode en VITIDEV OS AI

Referencia del ecosistema OpenCode. Usa `AGENTS.md`, `opencode.json` y `.opencode/`; no usa
`.claude/`. Instalación y uso básico: [README](../README.md).

Documentación oficial: [opencode.ai/docs](https://opencode.ai/docs/). Probado con OpenCode
**1.18.32 (V1)**.

## Qué carga al iniciar

| Pieza | Origen |
|---|---|
| Instrucciones | `AGENTS.md` (automático) |
| Memoria y reglas | Campo `instructions` de `opencode.json`: 4 archivos de `memoria/` y `.opencode/rules/*.md` |
| Skills | `.opencode/skills/` |
| Comandos | `.opencode/commands/` |
| Agentes | `.opencode/agents/` |
| Protección y estado | Plugin `.opencode/plugins/vitidev.js` |

## Aislamiento respecto a Claude Code

OpenCode tiene compatibilidad integrada con Claude Code: **descubre skills** en `.claude/skills/`
del proyecto y en `~/.claude/skills/` del usuario, y usa `CLAUDE.md` como respaldo si no hay
`AGENTS.md`. El proyecto lo neutraliza así:

| Medida | Dónde |
|---|---|
| `AGENTS.md` existe y no hay `CLAUDE.md` en la raíz | Raíz del repositorio |
| Skills propias con prioridad sobre las de `.claude/skills/` del mismo nombre | `.opencode/skills/` |
| Allowlist: `"*": "deny"` y `allow` solo para las 5 skills propias | `permission.skill` de `opencode.json` |
| Sin `skills.paths` hacia `.claude/` | `opencode.json` |

Las reglas de `permission` se evalúan en orden y **gana la última que coincide**: `"*": "deny"`
debe ir primero. `opencode debug skill` sigue listando las skills de Claude Code (las descubre),
pero el agente no puede usarlas.

Para que ni siquiera las descubra, inicia OpenCode con estas variables de entorno
(no existe una opción equivalente en `opencode.json`):

| Variable | Efecto |
|---|---|
| `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS=1` | No busca skills en `.claude/skills/` ni `~/.claude/skills/` |
| `OPENCODE_DISABLE_CLAUDE_CODE_PROMPT=1` | No carga `~/.claude/CLAUDE.md` |
| `OPENCODE_DISABLE_CLAUDE_CODE=1` | Desactiva toda la compatibilidad con Claude Code |

```powershell
$env:OPENCODE_DISABLE_CLAUDE_CODE = "1"; opencode
```

```bash
OPENCODE_DISABLE_CLAUDE_CODE=1 opencode
```

## Skills

Una carpeta `.opencode/skills/<nombre>/SKILL.md` con `name` y `description` en el frontmatter
(mismo formato que en Claude Code; el contenido es una copia propia). Después:

1. Añade `"<nombre>": "allow"` en `permission.skill` de `opencode.json`.
2. Si la skill usa plantillas, cítalas como `.opencode/skills/<nombre>/archivo.md`.

Sin el paso 1, la skill queda denegada por `"*": "deny"`.

## Comandos

Un archivo `.opencode/commands/<nombre>.md`. El cuerpo es la plantilla del prompt.

```markdown
---
description: "Resume un PDF en puntos clave."
---

Resume el PDF indicado: $ARGUMENTS
```

| Elemento | Uso |
|---|---|
| `description` | Texto en la lista de `/`. Entre comillas si contiene `: ` |
| `$ARGUMENTS`, `$1`, `$2` | Argumentos del comando |
| `agent`, `model`, `subagent` | Opcionales. El proyecto no fija `model` |

Un comando puede pedir al agente que cargue una skill propia con la herramienta `skill`.

## Agentes

Un archivo `.opencode/agents/<nombre>.md`:

```markdown
---
description: "Revisa textos y propone correcciones."
mode: subagent
permission:
  edit: deny
  bash: deny
---

Eres el revisor de VITIDEV OS AI. ...
```

- `mode: subagent`: lo invoca el agente principal (herramienta `task`) o el usuario con `@nombre`.
- Usa `permission`, no `tools`. No fijes `model`: hereda el de la sesión.

La documentación actual de OpenCode describe V2, donde algunos campos de V1 (`permission`, `tools`,
`temperature`) pasan a ser heredados. Este proyecto usa el formato V1, que es el que ejecuta
OpenCode 1.x.

## Plugin

`.opencode/plugins/vitidev.js` exporta solo `default` (OpenCode trata cada export como un plugin):

| Hook | Efecto |
|---|---|
| `tool.execute.before` | Evalúa la herramienta con `.opencode/lib/reglas.mjs`; si debe bloquearse, lanza un error |
| `experimental.chat.system.transform` | Añade el resumen de estado al prompt de sistema |

OpenCode instala su SDK de plugins en `.opencode/node_modules/` la primera vez (excluido de git).
**OpenCode V2 no ejecuta plugins de V1**: en V2 quedan los permisos de `opencode.json`, pero no el
bloqueo en tiempo real ni el resumen de estado.

## Comprobar

```bash
npm run validar
npm test
npm run probar:opencode
```

`probar:opencode` usa `opencode debug` (sin llamar a ningún modelo) y comprueba configuración,
origen de las skills, allowlist, agentes y permisos.

## Errores frecuentes

| Síntoma | Causa |
|---|---|
| El agente no puede usar una skill nueva | Falta su `allow` en `permission.skill` |
| Aparecen skills de `~/.claude/skills` en `debug skill` | Descubrimiento normal; están denegadas. Usa `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS=1` para ocultarlas |
| El primer `opencode` tarda | Está instalando el SDK de plugins |
| El plugin no actúa | OpenCode V2, o un export distinto de `default` |
