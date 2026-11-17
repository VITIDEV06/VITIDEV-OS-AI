# Índice de la memoria

La memoria de VITIDEV IA OS son archivos Markdown. Todo se puede leer y editar a mano.
Es **la misma** para Claude Code y OpenCode: lo que guardas con una herramienta lo ve la otra.

| Archivo / carpeta | Contenido | ¿Se carga solo al iniciar? |
|---|---|---|
| [personal/perfil.md](personal/perfil.md) | Quién es el usuario | Sí (`CLAUDE.md` y `opencode.json`) |
| [personal/preferencias.md](personal/preferencias.md) | Cómo quiere trabajar | Sí |
| [objetivos.md](objetivos.md) | Metas a corto, medio y largo plazo | Sí |
| [proyectos/activos.md](proyectos/activos.md) | Proyectos en curso | Sí |
| [proyectos/pausados.md](proyectos/pausados.md) | Proyectos en espera | No, bajo demanda |
| [proyectos/finalizados.md](proyectos/finalizados.md) | Proyectos terminados | No, bajo demanda |
| [aprendizajes/INDICE.md](aprendizajes/INDICE.md) | Temas estudiados, uno por archivo | No, bajo demanda |
| [sesiones/](sesiones/) | Resumen de cada sesión cerrada con `/cerrar-sesion` | No, bajo demanda |
| [inbox.md](inbox.md) | Datos sin clasificar todavía | No, bajo demanda |

**Por qué no se carga todo:** cada archivo cargado ocupa contexto en cada mensaje.
Solo se carga lo necesario para conocer al usuario; el resto se lee cuando hace falta.

Para gestionar la memoria usa `/guardar`, `/gestionar-memoria` o pídelo con tus palabras.
