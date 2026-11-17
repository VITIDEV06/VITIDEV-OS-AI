# VITIDEV IA OS — Claude Code

Las instrucciones comunes están en `AGENTS.md` (fuente única, compartida con OpenCode).
Este archivo solo añade lo específico de Claude Code.

@AGENTS.md

## Memoria cargada automáticamente

La misma lista está en `instructions` de `opencode.json`: si cambias una, cambia la otra
(`npm run validar` lo comprueba).

@memoria/personal/perfil.md
@memoria/personal/preferencias.md
@memoria/objetivos.md
@memoria/proyectos/activos.md

## Específico de Claude Code

- Subagentes: herramienta `Agent` con `subagent_type: tutor | investigador | project-manager`
  (definidos en `.claude/agents/`).
- Las reglas de `.claude/rules/` se cargan solas; `memoria.md` y `workspace.md` solo al tocar esas carpetas.
- Al iniciar sesión, el hook `session-start.mjs` añade un resumen del estado (proyectos, plazos,
  repasos, inbox y próximos pasos). El hook `proteger.mjs` puede bloquear acciones: si lo hace,
  no intentes rodearlo; explica el bloqueo al usuario.
