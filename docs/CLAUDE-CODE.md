# Claude Code en VITIDEV OS AI

Referencia del ecosistema Claude Code. Todo vive en `.claude/`; no usa `AGENTS.md`,
`opencode.json` ni `.opencode/`. Instalación y uso básico: [README](../README.md).

Documentación oficial: [code.claude.com/docs](https://code.claude.com/docs/en/overview).

## Qué carga al iniciar

| Pieza | Archivo | Cuándo |
|---|---|---|
| Instrucciones | `.claude/CLAUDE.md` | Siempre |
| Memoria | Imports `@../memoria/...` de `.claude/CLAUDE.md` | Siempre |
| Reglas | `.claude/rules/seguridad.md`, `estilo.md` | Siempre |
| Reglas por ruta | `.claude/rules/memoria.md`, `workspace.md` (frontmatter `paths:`) | Al trabajar en esas carpetas |
| Estado | Hook `SessionStart` (`.claude/hooks/session-start.mjs`) | Al abrir la sesión |
| Skills y agentes | `.claude/skills/`, `.claude/agents/` | Se descubren al iniciar |

Claude Code solo lee `AGENTS.md` cuando no hay ningún `CLAUDE.md`; como existe
`.claude/CLAUDE.md`, nunca lo carga. Los imports `@` se resuelven **relativos al archivo** que los
contiene: desde `.claude/CLAUDE.md`, la memoria es `@../memoria/...`.

## Skills

Una carpeta `.claude/skills/<nombre>/SKILL.md`. El `name` debe coincidir con la carpeta.

```markdown
---
name: resumir-pdf
description: Resume un PDF en puntos clave. Úsala cuando el usuario pida "resume este PDF".
argument-hint: "<ruta del PDF>"
---

# Skill: resumir PDF

## Objetivo
## Cuándo activarse
## Procedimiento
## Reglas
## Resultado esperado
```

| Campo | Uso en el proyecto |
|---|---|
| `description` | Cuándo debe activarla el modelo. Si contiene `: `, ponla entre comillas |
| `argument-hint` | Texto de ayuda para `/nombre <argumentos>` |
| `disable-model-invocation: true` | Convierte la skill en **comando**: solo la lanza el usuario con `/nombre` |

Las plantillas que use la skill van en su misma carpeta y se citan con su ruta completa
(`.claude/skills/<nombre>/plantilla.md`).

## Comandos

Claude Code integró los comandos personalizados en las skills. En este proyecto un comando es una
skill con `disable-model-invocation: true` y `$ARGUMENTS` en el cuerpo. No se usa
`.claude/commands/`: si existiera un comando con el mismo nombre que una skill, ganaría la skill.

## Agentes (subagentes)

Un archivo `.claude/agents/<nombre>.md`:

```markdown
---
name: revisor
description: Revisa textos y propone correcciones. Úsalo cuando haya que revisar un entregable.
tools: Read, Grep, Glob
model: inherit
---

Eres el revisor de VITIDEV OS AI. ...
```

- `tools` limita las herramientas. Los tres agentes del proyecto son de solo lectura.
- `model: inherit` usa el modelo de la sesión; no fijes uno.
- Se invocan con la herramienta `Agent` (`subagent_type: <nombre>`) o desde `/agents`.

## Hooks y permisos

`.claude/settings.json` registra dos hooks con `$CLAUDE_PROJECT_DIR`:

| Hook | Script | Efecto |
|---|---|---|
| `SessionStart` | `session-start.mjs` | Añade al contexto proyectos, plazos, repasos e inbox |
| `PreToolUse` | `proteger.mjs` | Código 2 = bloqueo; JSON `permissionDecision: "ask"` = pedir confirmación |

La lógica está en `.claude/hooks/lib/reglas.mjs`. Para bloquear otro comando, añade un patrón a
`COMANDOS_PROHIBIDOS` y un caso en `tests/proteger.test.mjs`.

Los permisos `allow`, `ask` y `deny` del mismo archivo forman la segunda capa de seguridad. Los
ajustes personales van en `.claude/settings.local.json` (excluido de git).

## Comprobar

```bash
npm run validar
npm test
```

Después abre una sesión nueva (`claude`): skills, agentes y hooks se cargan al iniciar. `/agents`
lista los agentes y `/memory` muestra qué instrucciones están cargadas.

## Errores frecuentes

| Síntoma | Causa |
|---|---|
| No aparece el resumen de estado | No se aceptó confiar en la carpeta (los hooks no se ejecutan) |
| La memoria no se carga | Import con ruta relativa a la raíz en vez de a `.claude/` |
| La skill no aparece | `name` distinto de la carpeta o YAML inválido: `npm run validar` lo indica |
