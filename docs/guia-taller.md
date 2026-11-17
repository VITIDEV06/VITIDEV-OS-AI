# Guía del taller: "Tu propio agente de IA con VITIDEV IA OS" (2 horas)

Guía para el instructor y material de referencia para los participantes.

## Objetivos

**Objetivo general:** que cada participante termine con un agente personal que le conoce, recuerda
sus proyectos entre sesiones y tiene una skill creada por él.

**Objetivos específicos.** Al terminar, cada participante será capaz de:

1. Explicar la diferencia entre un chatbot y un agente con contexto, memoria, habilidades y reglas.
2. Recorrer la estructura del proyecto e identificar instrucciones, memoria, skills y agentes.
3. Completar su perfil y guardar, consultar y corregir datos en la memoria.
4. Crear un proyecto y obtener una revisión de prioridades.
5. Usar un subagente para estudiar o investigar un tema.
6. Reconocer las capas de seguridad y por qué una acción se bloquea.
7. Crear, validar y probar una skill propia.

## Público y requisitos

**Público:** estudiantes o profesionales sin experiencia previa con agentes. No hace falta saber
programar; ayuda haber usado una terminal alguna vez.

**Requisitos de cada participante:**

| Herramienta | Detalle |
|---|---|
| Equipo | Windows, macOS o Linux con permisos para instalar programas (verificado en Windows 11) |
| Node.js 20 o superior | [nodejs.org](https://nodejs.org) |
| Claude Code **o** OpenCode | Cada participante elige. Sin cuenta de pago: OpenCode con un modelo gratuito (`opencode models` lista los `opencode/…-free`) |
| Una copia limpia del proyecto | `git clone` o ZIP (ver [Primeros pasos](PRIMEROS-PASOS.md#2-descarga-el-proyecto)) |
| Editor de texto | VS Code u otro, para ver cómo cambian los archivos |
| Conexión a internet | Para el modelo y para el primer arranque de OpenCode |

## Preparación (antes del taller)

**Una semana antes**

- [ ] Envía a los participantes el enlace a [Primeros pasos](PRIMEROS-PASOS.md) con los pasos 1 a 4.
- [ ] Pide que ejecuten `npm test` y lleven el resultado (`fail 0`) o el error.

**El día anterior, en el equipo de demostración**

- [ ] `npm test` sin fallos.
- [ ] Sesión nueva de Claude Code abierta en la carpeta: `/agents` muestra los 3 agentes.
- [ ] Si se usa OpenCode: `npm run probar:opencode` sin fallos y un modelo elegido con `/models`.
- [ ] Copia limpia de la carpeta para la demo (la memoria empieza vacía). Nunca uses tu copia personal.
- [ ] Pregunta de control: "¿cuáles son tus reglas no negociables?" responde con las de `AGENTS.md`.

## Agenda

| Tiempo | Bloque | Qué se hace | Resultado del bloque |
|---|---|---|---|
| 0:00–0:15 | 1. ¿Qué es un agente personal? | Problema: el chat olvida. Idea: contexto + memoria + habilidades + reglas. Mostrar el diagrama de arquitectura del README | Entienden las cuatro piezas |
| 0:15–0:30 | 2. Recorrido por la carpeta | `AGENTS.md`, `CLAUDE.md` (imports `@`), `memoria/`, `workspace/`, `.claude/`. Abrir un `SKILL.md` y un agente | Saben dónde está cada pieza |
| 0:30–0:50 | 3. Identidad y memoria | Cada participante ejecuta `/conocerme`. Ver cómo cambian `perfil.md` y `objetivos.md`. Probar `/guardar` y "¿qué sabes de mí?" | Perfil completo y un dato guardado |
| 0:50–1:05 | 4. Proyectos | `/crear-proyecto` con un proyecto real. `/organizar` sobre `workspace/inbox/ejemplo-notas-sueltas.md`. `/revisar-proyectos` (agente `project-manager`) | Un proyecto registrado y el inbox clasificado |
| 1:05–1:10 | Pausa | | |
| 1:10–1:30 | 5. Aprender e investigar | `/estudiar <tema de su materia> 10` (agente `tutor`). `/investigar <pregunta>` (agente `investigador`): abrir el informe generado | Un aprendizaje registrado y un informe con fuentes |
| 1:30–1:40 | 6. Seguridad en vivo | Pedir al agente "lee el .env" o "borra la carpeta memoria": ver el bloqueo. Explicar las 3 capas | Entienden qué se bloquea y por qué |
| 1:40–1:55 | 7. Crea tu propia skill | Ejercicio final (abajo). Validar con `npm test` y probar en una sesión nueva | Una skill propia funcionando |
| 1:55–2:00 | 8. Cierre | `/cerrar-sesion`. Cerrar la herramienta, abrirla de nuevo y comprobar que el saludo recuerda los próximos pasos | Comprueban la memoria entre sesiones |

## Actividades prácticas

| Bloque | Actividad | Cómo comprobar que salió bien |
|---|---|---|
| 3 | Guarda con `/guardar` un dato que contradiga tu perfil | El agente muestra "Antes → Después" y espera tu confirmación |
| 3 | Pregunta "¿qué sabes de mí?" | Responde citando los archivos de `memoria/` |
| 4 | Crea un proyecto real con fecha límite | Existe `workspace/proyectos/<slug>/PROYECTO.md` y una entrada en `activos.md` |
| 4 | Ordena el inbox de ejemplo | El agente propone un plan y solo mueve con tu aprobación |
| 5 | Estudia un tema de tu materia durante 10 minutos | Aparece un archivo en `memoria/aprendizajes/` con fecha de repaso |
| 5 | Investiga una pregunta | Aparece un informe en `workspace/investigaciones/` con fuentes citadas |
| 6 | Pide leer `.env` | Mensaje "Bloqueado por seguridad: …" |
| Extra | Guarda algo en una herramienta y pregúntalo en la otra | La otra herramienta lo responde: la memoria es la misma |

## Ejercicio final: crea tu propia skill

**Enunciado:** crea una skill que resuelva una tarea que repites cada semana.

1. Elige una idea: `resumir-clase`, `preparar-examen`, `plan-semanal` o una propia.
2. Crea `.claude/skills/<nombre>/SKILL.md` siguiendo el ejemplo de
   [Primeros pasos, paso 10](PRIMEROS-PASOS.md#10-crea-tu-primera-skill).
3. Ejecuta `npm test` y corrige lo que indique el validador.
4. Abre una sesión nueva y pide la tarea con tus palabras.

**Criterios de éxito:**

- [ ] El `name` coincide con la carpeta y está en `kebab-case`.
- [ ] La `description` dice qué hace y con qué frases se activa.
- [ ] Tiene Objetivo, Procedimiento, Reglas y Resultado esperado.
- [ ] `npm test` termina con `fail 0`.
- [ ] El agente la usa cuando se la pides.

## Momentos clave que conviene provocar

1. **Memoria entre sesiones** (bloque 8): cerrar y reabrir; el agente sabe por dónde ibas.
2. **El agente pide permiso** (bloque 3): `/guardar` un dato que contradice el perfil muestra antes y después.
3. **El bloqueo de seguridad** (bloque 6): la petición peligrosa se detiene antes de ejecutarse.
4. **"Yo también puedo extenderlo"** (bloque 7): una skill es solo un archivo Markdown.

## Solución de problemas durante el taller

| Problema | Solución rápida |
|---|---|
| `node` no se reconoce | Instalar Node.js 20+ y abrir una terminal nueva |
| PowerShell bloquea `npm` | Usar `npm.cmd test` |
| No aparece un agente o un comando nuevo | Abrir una sesión nueva ([limitaciones.md](limitaciones.md), L1) |
| El primer `opencode` no responde | Esperar o repetir: está instalando el SDK de plugins (L10) |
| El modelo gratuito no sigue bien la skill | Repetir la petición de forma más explícita o cambiar de modelo (L5) |
| Un participante no tiene cuenta de Claude | Usar OpenCode con un modelo `opencode/…-free` |
| La memoria quedó con datos de otra persona | Restaurar con `git checkout -- memoria/` o volver a copiar la carpeta limpia |

Más casos en [FAQ.md](FAQ.md#solución-de-problemas).

## Preguntas frecuentes del taller

- **¿Mis datos salen de mi equipo?** La memoria está en tu disco, pero su contenido se envía al
  modelo como contexto en cada sesión. Ver [Privacidad y memoria](PRIVACIDAD-Y-MEMORIA.md).
- **¿Y si el agente se equivoca al guardar?** Los archivos de `memoria/` son Markdown: edítalos a mano.
- **¿Funciona en la app de escritorio o en VS Code?** Sí: usa la configuración de la carpeta.
- **¿Puedo cambiar de Claude Code a OpenCode a mitad del taller?** Sí: comparten la misma memoria.
- **¿Necesito pagar?** No necesariamente: OpenCode funciona con modelos gratuitos o con tu propio proveedor.

## Después del taller: plan de práctica

Una propuesta de cuatro semanas para convertir el sistema en un hábito:

| Semana | Práctica | Comando o recurso |
|---|---|---|
| 1 | Abre una sesión al empezar a estudiar y ciérrala con `/cerrar-sesion` | El resumen de inicio te recuerda los próximos pasos |
| 2 | Registra cada proyecto o asignatura activa y revísalos el lunes | `/crear-proyecto`, `/revisar-proyectos` |
| 3 | Estudia un tema por día y haz los repasos que te recuerde el inicio de sesión | `/estudiar` |
| 4 | Crea una segunda skill y ajusta tus preferencias según lo aprendido | [Primeros pasos](PRIMEROS-PASOS.md), `memoria/personal/preferencias.md` |

## Recursos para seguir aprendiendo

| Recurso | Para qué |
|---|---|
| [Glosario](GLOSARIO.md) | Repasar los conceptos del taller |
| [Estructura del proyecto](ESTRUCTURA-DEL-PROYECTO.md) | Saber qué se puede modificar |
| [Decisiones técnicas](decisiones.md) | Entender por qué el sistema está diseñado así |
| [Documentación de Claude Code](https://code.claude.com/docs/en/overview) | Skills, subagentes y hooks en profundidad |
| [Documentación de OpenCode](https://opencode.ai/docs/) | Agentes, comandos, permisos y plugins |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Proponer tu skill al proyecto |
