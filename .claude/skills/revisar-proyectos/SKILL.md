---
name: revisar-proyectos
description: Comando de revisión semanal de proyectos. El agente project-manager audita los proyectos activos, pausados y finalizados, detecta bloqueos, fechas próximas e incoherencias, y propone prioridades y cambios de estado.
argument-hint: "[slug de un proyecto | todos]"
disable-model-invocation: true
---

# /revisar-proyectos — Revisión de proyectos

Ámbito: $ARGUMENTS (por defecto, todos).

## Objetivo

Dar al usuario una visión honesta del estado de sus proyectos y un plan de prioridades para la semana.

## Procedimiento

1. **Delegar la auditoría** en el agente `project-manager` (herramienta de subagentes:
   `Agent` en Claude Code, `task` en OpenCode; `subagent_type: project-manager`). Indícale el ámbito y la fecha de hoy. Te devolverá un
   informe con: estado de cada proyecto, tareas abiertas/cerradas, próximo paso, fechas límite,
   riesgos e incoherencias entre registro y ficha, y propuestas de cambio.
2. **Presentar** el informe al usuario de forma compacta:
   - Tabla: `Proyecto | Estado | Avance | Fecha límite | Próximo paso | Alerta`.
   - Top 3 de prioridades para esta semana.
   - Propuestas de cambio numeradas (pausar, retomar, finalizar, actualizar próximo paso).
3. **Preguntar** qué propuestas aprueba (por número). Sin aprobación no cambies nada.
4. **Aplicar** las aprobadas: cambios de estado con la skill `gestionar-memoria`
   (operación "Cambiar el estado de un proyecto"); actualizaciones en `PROYECTO.md`
   (próximo paso, tareas, línea en la bitácora con la fecha de hoy).
5. Si no hay proyectos, dilo y sugiere `/crear-proyecto`.

## Reglas

- No cambies nada sin aprobación del usuario.
- No inventes tareas ni fechas que no estén en los archivos.

## Resultado esperado

- El usuario sabe qué hacer esta semana en cada proyecto.
- Registros y fichas coherentes entre sí, con los cambios aprobados aplicados.
