---
description: Revisión de proyectos con el agente project-manager, prioridades y cambios de estado (VITIDEV IA OS)
---

Ejecuta el flujo `/revisar-proyectos` de VITIDEV IA OS.

1. Lee el procedimiento de la skill `revisar-proyectos` en `.claude/skills/revisar-proyectos/SKILL.md` con la
   herramienta de lectura (es una skill de comando: no se carga con la herramienta `skill`).
2. Sigue su procedimiento paso a paso. Ámbito: «$ARGUMENTS» (vacío = todos los proyectos).
3. Para la auditoría, lanza el subagente `project-manager` con la herramienta `task`
   (`subagent_type: project-manager`). No apliques cambios sin aprobación del usuario.
