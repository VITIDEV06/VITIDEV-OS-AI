# Changelog

Todos los cambios relevantes de VITIDEV IA OS se documentan en este archivo.

El formato se basa en [Keep a Changelog 1.1.0](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto sigue [Versionado Semántico 2.0.0](https://semver.org/lang/es/):

- **MAYOR**: cambios que rompen la estructura de `memoria/`, los nombres de comandos o la configuración.
- **MENOR**: skills, agentes, comandos o documentación nuevos compatibles con lo anterior.
- **PARCHE**: correcciones que no cambian el comportamiento esperado.

Secciones por versión: `Añadido`, `Cambiado`, `Obsoleto`, `Eliminado`, `Corregido`, `Seguridad`.

## [Sin publicar]

Preparación del repositorio para su publicación como proyecto educativo de código abierto.

### Añadido

- `LICENSE`: licencia MIT (2026, Victor Montes).
- `CONTRIBUTING.md`, `SECURITY.md` y `CODE_OF_CONDUCT.md` (adaptación de Contributor Covenant 2.1).
- Documentación educativa en `docs/`: `PRIMEROS-PASOS.md`, `FAQ.md`, `GLOSARIO.md`,
  `ESTRUCTURA-DEL-PROYECTO.md` y `PRIVACIDAD-Y-MEMORIA.md`.
- Plantillas de GitHub: informe de error, propuesta de funcionalidad y Pull Request.

### Cambiado

- `README.md`: instalación rápida con `git clone`, configuración, documentación, solución de
  problemas, contribuciones, licencia MIT y roadmap con cuatro estados.
- `docs/guia-taller.md`: objetivos, preparación, actividades, ejercicio final, solución de problemas
  y plan de práctica posterior, con la misma agenda de 2 horas.
- `package.json`: campo `license` y descripción multiplataforma.

### Corregido

- Protección: la regla que impide borrar `memoria/` exige ahora que la orden de borrado (`rm`, `del`,
  `Remove-Item`…) esté en posición de comando. Antes bloqueaba comandos legítimos cuyo texto contenía
  la preposición "del" seguida de "memoria". Dos pruebas nuevas (30 en total).

### Seguridad

- La misma regla detecta también `git rm`, `xargs rm`, `erase`, `ri` y `$(rm …)` sobre `memoria/`.
- `.gitignore`: el contenido que crea el usuario en `memoria/` y `workspace/` (aprendizajes,
  sesiones, proyectos, investigaciones, materias, entregables, inbox y archivo) queda fuera de git
  por defecto. Las plantillas compartidas siguen versionadas.

## [1.0.0] - 2026-11-16

Primera versión, compatible con Claude Code y OpenCode V1.

### Añadido

- **Núcleo compartido:** `AGENTS.md` como fuente única de instrucciones; `CLAUDE.md` lo importa con
  `@AGENTS.md` y carga la memoria con imports `@`.
- **Reglas:** seguridad, memoria (`paths: memoria/**`), workspace (`paths: workspace/**`) y estilo.
- **Memoria:** perfil, preferencias, objetivos, proyectos (activos, pausados y finalizados),
  aprendizajes, sesiones e inbox.
- **Skills de capacidad:** `aprender`, `investigar`, `organizar`, `crear-proyecto`, `gestionar-memoria`.
- **Comandos:** `/conocerme`, `/estudiar`, `/investigar`, `/guardar`, `/revisar-proyectos`, `/cerrar-sesion`.
- **Agentes de solo lectura:** `tutor`, `investigador`, `project-manager`.
- **Claude Code:** hooks `SessionStart` (estado al iniciar) y `PreToolUse` (protección), y permisos
  allow/ask/deny en `.claude/settings.json`.
- **OpenCode V1:** `opencode.json` sin modelo ni credenciales, agentes generados en `.opencode/agents/`
  (`npm run sincronizar`), comandos en `.opencode/commands/` y plugin `.opencode/plugins/vitidev.js`
  con la misma lógica de protección y estado.
- **Calidad:** validador estructural (`npm run validar`), 28 pruebas automáticas sin dependencias
  (`npm test`) y comprobación de OpenCode sin modelo (`npm run probar:opencode`).
- **Documentación:** README, decisiones técnicas, limitaciones y guía de taller de 2 horas.

### Verificado

- OpenCode 1.18.32 con un modelo real: 10 de 10 pruebas obligatorias (detalle en `docs/limitaciones.md`).
- Claude Code 2.1.x: agentes, hook `SessionStart` y bloqueo del hook `PreToolUse` en una sesión real.

[Sin publicar]: https://github.com/VITIDEV06/VITIDEV-AI-OS/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/VITIDEV06/VITIDEV-AI-OS/releases/tag/v1.0.0
