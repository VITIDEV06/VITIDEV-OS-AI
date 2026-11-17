---
description: Guarda un dato en el archivo correcto de la memoria persistente (VITIDEV IA OS)
---

Ejecuta el flujo `/guardar` de VITIDEV IA OS.

1. Lee el procedimiento de la skill `guardar` en `.claude/skills/guardar/SKILL.md` con la
   herramienta de lectura (es una skill de comando: no se carga con la herramienta `skill`).
2. Sigue su procedimiento. El dato que el usuario quiere guardar es: «$ARGUMENTS»
3. Aplica la operación "Guardar" de la skill `gestionar-memoria`
   (`.claude/skills/gestionar-memoria/SKILL.md`): nunca cambies un dato existente sin aprobación.
