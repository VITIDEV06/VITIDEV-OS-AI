---
name: crear-proyecto
description: Crea un proyecto nuevo con carpeta en workspace/proyectos/<slug>/, ficha PROYECTO.md con objetivo, alcance, tareas y próximo paso, y lo registra en memoria/proyectos/activos.md. Úsala cuando el usuario diga "nuevo proyecto", "quiero empezar…", "crea un proyecto para…" o cuando una idea del inbox se convierta en proyecto.
argument-hint: "<nombre del proyecto>"
---

# Skill: crear proyecto

Proyecto: $ARGUMENTS

## Objetivo

Convertir una intención en un proyecto con objetivo, tareas y próximo paso, registrado en la memoria y con su carpeta de trabajo.

## Cuándo activarse

- El usuario quiere iniciar un trabajo con varias tareas y más de una sesión de duración.
- Para tareas sueltas de una sola sesión, no crees un proyecto: hazlas o apúntalas.

## Procedimiento

1. **Slug.** Convierte el nombre a `kebab-case` sin acentos (`Taller de IA` → `taller-de-ia`).
   Comprueba que no exista `workspace/proyectos/<slug>/` ni una sección `## <slug>` en
   `memoria/proyectos/*.md`. Si existe, pregunta si quiere retomarlo en lugar de crearlo.
2. **Definición mínima.** Pregunta solo lo que falte (en un único mensaje):
   - ¿Cuál es el objetivo (resultado concreto)?
   - ¿Fecha límite? (opcional)
   - ¿Tipo? personal / universidad / trabajo
   - ¿Primer paso que harás?
3. **Crear la carpeta y la ficha:** `workspace/proyectos/<slug>/PROYECTO.md` a partir de
   `plantilla-proyecto.md` (junto a este archivo). Propón 3–6 tareas iniciales
   a partir del objetivo y márcalas como propuesta.
4. **Registrar** en `memoria/proyectos/activos.md` con `plantilla-registro.md`.
   Si es el primer proyecto, sustituye la línea `_Sin proyectos activos…_`.
   Actualiza `actualizado:` del frontmatter.
5. **Vincular objetivo:** si encaja con un objetivo de `memoria/objetivos.md`, menciónalo en la ficha.
6. **Confirmar:** muestra la ruta de la ficha y el próximo paso.

## Reglas

- No dupliques proyectos: si el slug ya existe, ofrece retomarlo.
- Las tareas propuestas por ti se marcan como propuesta.
- Pregunta solo lo que falte, en un único mensaje.

## Resultado esperado

- Existe `workspace/proyectos/<slug>/PROYECTO.md` completo.
- Existe la sección `## <slug>` en `memoria/proyectos/activos.md`.
- El usuario sabe cuál es el próximo paso.
