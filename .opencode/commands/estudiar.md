---
description: Sesión de estudio guiada sobre un tema, con el agente tutor y registro del aprendizaje (VITIDEV IA OS)
---

Ejecuta el flujo `/estudiar` de VITIDEV IA OS.

1. Lee el procedimiento de la skill `estudiar` en `.claude/skills/estudiar/SKILL.md` con la
   herramienta de lectura (es una skill de comando: no se carga con la herramienta `skill`).
2. Sigue su procedimiento paso a paso. Donde diga `$ARGUMENTS`, usa: «$ARGUMENTS»
3. Para preparar el material, lanza el subagente `tutor` con la herramienta `task`
   (`subagent_type: tutor`).
4. Registra el aprendizaje siguiendo la skill `aprender` (paso "Registro").
