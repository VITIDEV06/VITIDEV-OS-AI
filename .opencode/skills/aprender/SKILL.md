---
name: aprender
description: Enseña un concepto adaptándose al nivel y preferencias del usuario, comprueba la comprensión con preguntas y registra lo aprendido en memoria/aprendizajes/. Úsala cuando el usuario pida "explícame…", "no entiendo…", "quiero aprender…", "¿cómo funciona…?", o pida repasar un tema ya estudiado.
argument-hint: "<tema o concepto>"
---

# Skill: aprender

Tema: $ARGUMENTS

## Objetivo

Que el usuario entienda un concepto (no solo que lo lea), lo demuestre respondiendo preguntas y quede registro para repasarlo.

## Cuándo activarse

- El usuario quiere **entender** algo (no solo obtener un dato puntual).
- El usuario pide repasar un tema que aparece en `memoria/aprendizajes/INDICE.md`.

Para una sesión de estudio larga y estructurada, el usuario dispone de `/estudiar`,
que usa esta misma metodología y además delega en el agente `tutor`.

## Procedimiento

1. **Contexto.** Revisa `memoria/personal/preferencias.md` (cómo aprende mejor) y busca el tema
   en `memoria/aprendizajes/`. Si ya lo estudió, parte de lo registrado y de sus dudas pendientes.
2. **Diagnóstico.** Si no conoces su nivel, haz **una** pregunta corta: "¿Qué sabes ya de X?"
3. **Explicación por capas:**
   - Idea central en 2–3 frases, sin jerga.
   - Un ejemplo concreto o analogía (según sus preferencias).
   - Detalle técnico y términos clave.
   - Errores frecuentes.
4. **Comprobación activa.** Haz 2–3 preguntas de una en una (aplicar, no repetir).
   Corrige con explicación breve. Si falla, reexplica desde otro ángulo.
5. **Cierre.** Pídele que resuma la idea con sus palabras (técnica Feynman).
6. **Registro** (pregunta antes: "¿Guardo este aprendizaje?"):
   - Crea `memoria/aprendizajes/AAAA-MM-DD-<tema-en-kebab>.md` con
     `plantilla-aprendizaje.md` (está junto a este archivo).
   - Añade la línea al índice `memoria/aprendizajes/INDICE.md`
     (sustituye `_Sin aprendizajes registrados…_` si es el primero).
   - Próximo repaso sugerido: +3 días si el dominio es bajo, +7 si es medio, +21 si es alto.

## Reglas

- Una pregunta de comprobación cada vez; no muestres la solución antes de que responda.
- No inventes datos; si no estás seguro, dilo.
- Pide permiso antes de guardar el aprendizaje.

## Resultado esperado

- El usuario entiende el concepto y lo ha demostrado respondiendo preguntas.
- Si aceptó, existe un archivo de aprendizaje con resumen, dudas y fecha de repaso,
  enlazado desde el índice.
