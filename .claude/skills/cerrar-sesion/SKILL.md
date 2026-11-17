---
name: cerrar-sesion
description: Comando de cierre de sesión. Resume lo trabajado, actualiza proyectos y memoria con lo aprendido o decidido (con aprobación) y deja un registro en memoria/sesiones/ con los próximos pasos para la siguiente sesión.
disable-model-invocation: true
---

# /cerrar-sesion — Cerrar la sesión

## Objetivo

Que ninguna sesión productiva termine sin dejar memoria actualizada y próximos pasos claros para la siguiente.

## Procedimiento

1. **Revisar la conversación** e identificar:
   - Qué se hizo (tareas, archivos creados o editados).
   - Decisiones tomadas.
   - Datos nuevos sobre el usuario (preferencias, objetivos).
   - Aprendizajes no registrados todavía.
   - Cambios en proyectos (tareas completadas, nuevo próximo paso, cambio de estado).
2. **Proponer actualizaciones de memoria** en una lista numerada, indicando el archivo destino.
   Pregunta cuáles aplicar. Aplica solo las aprobadas con la skill `gestionar-memoria`
   (y `aprender` para aprendizajes).
3. **Actualizar proyectos tocados:** en `PROYECTO.md`, marca tareas hechas, actualiza
   "Próximo paso" y añade una línea a la "Bitácora". Refleja el próximo paso también en
   `memoria/proyectos/activos.md`.
4. **Escribir el registro de sesión** en `memoria/sesiones/AAAA-MM-DD.md` (fecha de hoy).
   Si el archivo ya existe, **añade** una sección nueva al final; no reescribas lo anterior:

   ```markdown
   ## Sesión HH:MM
   **Hecho:** …
   **Decisiones:** …
   **Memoria actualizada:** archivos …
   **Próximos pasos:**
   - [ ] …
   ```
5. **Despedida:** en 3 líneas, lo logrado hoy y con qué empezar la próxima vez.

## Reglas

- Solo se aplican las actualizaciones de memoria que el usuario apruebe.
- El registro de sesión se añade al final del archivo del día; nunca se reescribe lo anterior.

## Resultado esperado

- Un registro de sesión con próximos pasos (el hook de inicio lo mostrará la próxima vez).
- Memoria y proyectos actualizados solo con lo aprobado.
