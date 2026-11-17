---
description: "Investiga una pregunta con fuentes citadas y guarda el informe en workspace/investigaciones/"
---

<!-- Comando de OpenCode. Archivo propio: editarlo no cambia el comando homónimo de Claude Code. -->

# /investigar — Investigación con fuentes

Pregunta: $ARGUMENTS

1. Carga la skill `investigar` con la herramienta `skill` (está en `.opencode/skills/investigar/`).
2. Sigue su procedimiento paso a paso. Si la pregunta está vacía, pídela al usuario.
3. Para la búsqueda, lanza el subagente `investigador` con la herramienta `task`
   (`subagent_type: investigador`).
