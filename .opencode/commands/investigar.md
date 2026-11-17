---
description: Investiga una pregunta con fuentes citadas y guarda el informe en workspace/investigaciones (VITIDEV IA OS)
---

Ejecuta el flujo `/investigar` de VITIDEV IA OS.

1. Carga la skill `investigar` con la herramienta `skill`. Si no puedes cargarla, lee
   `.claude/skills/investigar/SKILL.md` con la herramienta de lectura.
2. Sigue su procedimiento paso a paso. La pregunta de investigación es: «$ARGUMENTS»
   (si está vacía, pregúntala al usuario).
3. Para la búsqueda, lanza el subagente `investigador` con la herramienta `task`
   (`subagent_type: investigador`).
