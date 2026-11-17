---
description: "Comando de bienvenida. Entrevista breve para conocer al usuario y completar su perfil, preferencias y objetivos en memoria/. Ejecútalo la primera vez o para actualizar el perfil."
---

<!-- Comando de OpenCode. Archivo propio: editarlo no cambia el comando homónimo de Claude Code. -->

# /conocerme — Conocer al usuario

Modo: $ARGUMENTS (por defecto `rápido`: 3 bloques; `completo`: los 4 bloques).

## Objetivo

Que VITIDEV OS AI sepa quién es el usuario, cómo quiere trabajar y qué quiere lograr,
y que eso quede guardado en la memoria persistente.

## Procedimiento

1. **Lee** `memoria/personal/perfil.md`, `memoria/personal/preferencias.md` y `memoria/objetivos.md`.
   Si ya tienen datos, muéstralos resumidos y pregunta qué quiere actualizar (no repitas la entrevista entera).
2. **Presenta** el proceso en una línea: "Te haré unas preguntas en bloques; puedes saltar cualquiera".
3. **Entrevista por bloques**, un bloque por mensaje, máximo 3 preguntas por bloque:
   - **Bloque 1 — Identidad:** nombre y cómo quiere que le llames; ocupación o estudios; ubicación/zona horaria.
   - **Bloque 2 — Forma de trabajar:** tono y longitud de respuestas preferidos; cómo aprende mejor; horario y herramientas.
   - **Bloque 3 — Objetivos:** 1–3 metas para las próximas semanas; alguna meta para los próximos meses o años.
   - **Bloque 4 (solo `completo`) — Contexto:** conocimientos fuertes; en qué quiere mejorar; proyectos en marcha.
4. **Resumen y confirmación.** Muestra lo que vas a guardar, agrupado por archivo, y espera aprobación.
5. **Guardar** siguiendo la skill `gestionar-memoria`:
   - Sustituye los marcadores `_sin completar_` por las respuestas. Lo que no respondió queda como está.
   - En `perfil.md` cambia `estado: sin-completar` a `estado: completo` si hay al menos nombre, ocupación y un interés.
   - Objetivos con el formato `- [ ] Objetivo — fecha límite`.
   - Proyectos en marcha: ofrece crearlos con la skill `crear-proyecto` (uno por uno).
6. **Cierre:** saluda por su nombre y sugiere 2 comandos útiles según lo que contó
   (por ejemplo `/estudiar` si estudia, la skill `crear-proyecto` si tiene proyectos).

## Reglas

- Máximo 3 preguntas por mensaje; el usuario puede saltar cualquiera.
- No sobrescribas datos existentes sin mostrar antes el cambio y obtener aprobación.
- No pidas ni guardes datos sensibles (documentos de identidad, contraseñas, salud, finanzas).

## Resultado esperado

- `perfil.md`, `preferencias.md` y `objetivos.md` actualizados con fecha de hoy.
- `perfil.md` en `estado: completo` (si hubo datos mínimos).
- Ningún dato existente sobrescrito sin confirmación.
