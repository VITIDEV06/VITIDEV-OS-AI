---
name: estudiar
description: Comando de sesión de estudio guiada sobre un tema - diagnóstico, plan, explicación, práctica con preguntas y registro del aprendizaje. Delega la preparación del material en el agente tutor.
argument-hint: "<tema> [minutos disponibles]"
disable-model-invocation: true
---

# /estudiar — Sesión de estudio

Tema y tiempo: $ARGUMENTS

Si no hay tema, pregunta cuál. Si no indica tiempo, asume 25 minutos (un pomodoro).

## Objetivo

Guiar una sesión de estudio completa y medible (diagnóstico, explicación, práctica y registro) adaptada al nivel y al tiempo del usuario.

## Procedimiento

1. **Contexto (sin preguntar):**
   - Preferencias de aprendizaje en `memoria/personal/preferencias.md`.
   - ¿Ya estudió este tema? Busca en `memoria/aprendizajes/INDICE.md`. Si existe, es un **repaso**:
     empieza por sus "Dudas pendientes" y "Preguntas de repaso".
   - ¿Pertenece a una materia o proyecto? Mira `workspace/universidad/` y `memoria/proyectos/activos.md`.
2. **Diagnóstico:** una pregunta: "¿Qué sabes ya de <tema>, y para qué lo necesitas (examen, proyecto, curiosidad)?"
3. **Preparar material con el agente `tutor`** (herramienta de subagentes: `Agent` en Claude Code, `task` en OpenCode; `subagent_type: tutor`). Pásale:
   tema, nivel detectado, objetivo, tiempo disponible, preferencias de aprendizaje y
   (si es repaso) el contenido del archivo de aprendizaje previo.
   Pídele: plan de la sesión por bloques, explicación por capas, 3–5 preguntas de práctica
   con soluciones y errores típicos.
4. **Impartir la sesión tú mismo** con ese material (el agente no puede hablar con el usuario):
   - Muestra el plan (bloques y minutos).
   - Explica un bloque a la vez y pregunta si sigue antes de avanzar.
   - Haz las preguntas de práctica **de una en una**, sin mostrar la solución hasta que responda.
   - Lleva la cuenta de aciertos.
5. **Cierre:** pide un resumen con sus palabras; calcula el dominio
   (≥80 % aciertos → alto, 50–79 % → medio, <50 % → bajo).
6. **Registrar** con la skill `aprender` (paso "Registro"): archivo en `memoria/aprendizajes/`
   y línea en el índice. Si es repaso, actualiza el archivo existente (mostrando el cambio).
7. **Siguiente paso:** propone la fecha de repaso y, si aplica, una tarea en el proyecto relacionado.

## Reglas

- El agente tutor prepara el material; tú impartes la sesión y haces las preguntas.
- Las preguntas de práctica van de una en una.
- Pide permiso antes de registrar el aprendizaje.

## Resultado esperado

- Sesión completada con práctica y puntuación.
- Aprendizaje registrado (si el usuario aceptó) con fecha de próximo repaso.
