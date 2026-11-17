---
name: organizar
description: Ordena el material del usuario sin perder nada. Clasifica archivos de workspace/inbox/ y entradas de memoria/inbox.md en su lugar correcto, detecta duplicados y desorden en memoria y workspace, y propone un plan que solo ejecuta con aprobación. Úsala cuando el usuario diga "organiza…", "ordena…", "limpia…", "clasifica…" o cuando el inbox tenga contenido pendiente.
argument-hint: "[inbox|memoria|workspace|<carpeta>]"
---

# Skill: organizar

Ámbito: $ARGUMENTS (si está vacío: `workspace/inbox/` y `memoria/inbox.md`).

## Objetivo

Que todo el material del usuario esté en su sitio, sin perder nada y sin mover nada sin su aprobación.

## Cuándo activarse

- El usuario pide ordenar, clasificar o limpiar.
- Detectas archivos en `workspace/inbox/` (aparte de `README.md`) o entradas en `memoria/inbox.md`.

## Reglas

- **Nunca borres.** Lo descartado va a `workspace/_archivo/`.
- **Primero el plan, después la acción.** Nada se mueve sin aprobación.
- Una cosa vive en un solo sitio.

## Procedimiento

1. **Inventario.** Lista y lee los elementos del ámbito (herramientas glob y de lectura). Ignora los `README.md`.
2. **Clasificación.** Para cada elemento decide su destino:

   | Contenido | Destino |
   |---|---|
   | Tarea o dato de una materia | `workspace/universidad/<materia>/` |
   | Idea o trabajo de un proyecto existente | `workspace/proyectos/<slug>/` |
   | Idea de proyecto nuevo | Proponer la skill `crear-proyecto` (no crearlo sin permiso) |
   | Dato personal / preferencia / objetivo | Archivo de `memoria/` (skill `gestionar-memoria`) |
   | Fecha límite | `objetivos.md` o ficha del proyecto |
   | Tema que estudiar | Sugerir `/estudiar <tema>` |
   | Obsoleto o duplicado | `workspace/_archivo/` |

   Si un archivo mezcla varias cosas, propón dividirlo: cada parte va a su destino.
3. **Plan.** Muestra una tabla `Elemento → Destino → Acción (mover / copiar a memoria / archivar)`.
4. **Aprobación.** Espera "sí" (o cambios). Puede aprobar todo o solo algunas filas.
5. **Ejecución.** Para mover, escribe el contenido en el destino y después mueve el original
   a `workspace/_archivo/` (así no hay pérdida si algo falla). Para datos de memoria, sigue
   la skill `gestionar-memoria`. Crea carpetas con `mkdir -p` si no existen.
6. **Informe.** Resume qué se movió y dónde, y qué quedó pendiente.

## Resultado esperado

- Inbox vacío (salvo `README.md`) o con los elementos que el usuario decidió dejar.
- Ningún archivo perdido; todo lo retirado está en `workspace/_archivo/`.
- Lista final de cambios con rutas.
