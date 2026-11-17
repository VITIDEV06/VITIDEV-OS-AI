# Cómo contribuir a VITIDEV OS AI

Gracias por querer mejorar el proyecto. Esta guía explica, paso a paso, cómo proponer cambios
aunque sea tu primera contribución en GitHub. Al participar aceptas el
[Código de conducta](CODE_OF_CONDUCT.md).

## Qué contribuciones se aceptan

| Tipo | Ejemplos | Aceptación |
|---|---|---|
| Correcciones | Erratas, enlaces rotos, errores en hooks o en el validador | Bienvenidas siempre |
| Documentación | Explicaciones más claras, ejemplos, preguntas frecuentes | Bienvenidas siempre |
| Skills nuevas | Una capacidad útil para estudiar, investigar u organizarse | Con propuesta previa (issue) |
| Agentes nuevos | Un especialista con una función que no cubran los tres actuales | Con propuesta previa (issue) |
| Protección | Nuevos patrones de secretos o comandos destructivos, con su prueba | Bienvenidas, con prueba |
| Compatibilidad | Pruebas con otras versiones de Claude Code u OpenCode (por ejemplo, V2) | Con evidencia de la prueba |

No se aceptan:

- Datos personales reales en `memoria/` o `workspace/` (los tuyos ni los de nadie).
- Modelos, proveedores, claves de API o tokens fijados en la configuración.
- Dependencias externas sin una razón muy justificada: el proyecto funciona solo con Node.js.
- Funcionalidades que dupliquen contenido entre Claude Code y OpenCode en lugar de compartirlo.
- Cambios que debiliten la protección (permisos, hook `PreToolUse` o plugin de OpenCode).

## 1. Prepara tu copia

### Haz un fork

En la página del repositorio, pulsa **Fork**. GitHub crea una copia en tu cuenta donde puedes
trabajar sin permisos especiales. Guía oficial: [Bifurcar un repositorio](https://docs.github.com/es/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo).

### Clona tu fork

```bash
git clone https://github.com/TU-USUARIO/VITIDEV-OS-AI.git
cd VITIDEV-OS-AI
git remote add upstream https://github.com/VITIDEV06/VITIDEV-OS-AI.git
```

`upstream` apunta al repositorio original y te permite traer sus cambios más tarde.

### Prepara el entorno

Solo necesitas [Node.js 20 o superior](https://nodejs.org) y git. No hay dependencias que instalar.

```bash
node --version
npm test
```

Si `npm test` termina con `fail 0`, el entorno está listo. Para probar los cambios con un agente,
instala Claude Code u OpenCode siguiendo [Primeros pasos](docs/PRIMEROS-PASOS.md).

## 2. Crea una rama

Trabaja siempre en una rama propia, nunca en `master`:

```bash
git checkout master
git pull upstream master
git checkout -b tipo/descripcion-corta
```

| Prefijo | Uso | Ejemplo |
|---|---|---|
| `fix/` | Corrección de errores | `fix/enlace-roto-faq` |
| `docs/` | Solo documentación | docs/glosario-mcp |
| `feat/` | Skill, agente o comando nuevo | `feat/skill-resumir-clase` |
| `seguridad/` | Protección y permisos | `seguridad/patron-tokens-github` |

## 3. Respeta la arquitectura

Claude Code y OpenCode son **ecosistemas independientes**: cada uno tiene sus propios archivos y
ninguno referencia al otro. Solo `memoria/` y `workspace/` son comunes. Ubica tu cambio en esta tabla
(detalle en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) y motivos en
[docs/decisiones.md](docs/decisiones.md)):

| Quieres cambiar… | Claude Code | OpenCode |
|---|---|---|
| Instrucciones | `.claude/CLAUDE.md` | `AGENTS.md` |
| Reglas | `.claude/rules/` | `.opencode/rules/` (y `instructions` de `opencode.json`) |
| Una skill | `.claude/skills/<nombre>/SKILL.md` | `.opencode/skills/<nombre>/SKILL.md` y su `allow` en `permission.skill` |
| Un comando | Skill con `disable-model-invocation: true` | `.opencode/commands/<nombre>.md` |
| Un agente | `.claude/agents/<nombre>.md` | `.opencode/agents/<nombre>.md` |
| Protección | `.claude/hooks/lib/reglas.mjs` | `.opencode/lib/reglas.mjs` |
| Memoria cargada al iniciar | Imports de `.claude/CLAUDE.md` | `instructions` de `opencode.json` |

Si un cambio debe estar en las dos herramientas, hazlo en los dos lados. No uses imports, symlinks
ni scripts que generen archivos de un ecosistema a partir del otro: `npm run validar` lo detecta.

### Convenciones

- **Idioma:** documentación, skills y mensajes en español claro.
- **Nombres:** archivos, carpetas, skills y slugs en `kebab-case`, sin acentos ni espacios.
- **Fechas:** formato `AAAA-MM-DD`.
- **Skills:** frontmatter con `name` (igual que la carpeta) y `description`, y las secciones
  `Objetivo`, `Procedimiento`, `Reglas` y `Resultado esperado`. Las skills de capacidad añaden
  `Cuándo activarse`.
- **Estilo:** sin emojis decorativos, frases cortas y tablas cuando comparen opciones.
- **Código:** módulos ESM (`.mjs`), solo biblioteca estándar de Node.js, funciones puras en
  `.claude/hooks/lib/` y `.opencode/lib/` para poder probarlas.

## 4. Documenta lo que añadas

Cada funcionalidad nueva debe quedar documentada en el mismo Pull Request:

1. **README:** si añade un comando, skill o agente, actualiza sus tablas.
2. **Documentación específica:** `docs/FAQ.md`, `docs/PRIMEROS-PASOS.md` o el documento que corresponda.
3. **Decisión técnica:** si cambia la arquitectura, añade una entrada en `docs/decisiones.md`.
4. **Limitaciones:** si algo no está probado o no funciona en una herramienta, regístralo en
   `docs/limitaciones.md`. No declares compatibilidades que no hayas probado.
5. **Changelog:** añade una línea en la sección `[Sin publicar]` de [CHANGELOG.md](CHANGELOG.md).

## 5. Ejecuta las pruebas

```bash
npm run validar
npm test
```

| Comando | Comprueba | Debe terminar con |
|---|---|---|
| `npm run validar` | Estructura, frontmatter, enlaces, rutas, coherencia entre Claude Code y OpenCode, ausencia de credenciales | `0 error(es)` |
| `npm test` | Validador, hooks, flujos de memoria, adaptador y plugin de OpenCode | `fail 0` |
| `npm run probar:opencode` | Solo si tienes OpenCode instalado: comandos, skills, agentes y permisos | Sin fallos |

Si cambias la protección, añade un caso en `tests/proteger.test.mjs`. Si cambias el adaptador o el
plugin de OpenCode, en `tests/opencode.test.mjs`.

## 6. Protege la información privada

Antes de cada commit:

```bash
git status
git diff --staged
```

Comprueba que **no** aparecen:

- Cambios en `memoria/` con datos reales: perfil, objetivos, proyectos o sesiones tuyas.
- Archivos de `workspace/` con apuntes, informes o trabajos personales.
- Archivos `.env`, claves, tokens, contraseñas o certificados.
- Rutas locales que identifiquen tu equipo (por ejemplo, `C:\Users\tu-nombre\...`).

Si tu ejemplo necesita datos, usa valores ficticios como `taller-de-ia` o "Estudiante de Ingeniería".
Más detalle en [SECURITY.md](SECURITY.md) y [docs/PRIVACIDAD-Y-MEMORIA.md](docs/PRIVACIDAD-Y-MEMORIA.md).

## 7. Envía el Pull Request

```bash
git add ruta/del/archivo.md
git commit -m "docs: aclara la instalación de OpenCode en Windows"
git push origin tipo/descripcion-corta
```

Añade los archivos por nombre en lugar de `git add .` para no incluir nada personal por error.

Después, en GitHub, abre tu fork y pulsa **Compare & pull request**. La plantilla te pedirá:

1. Resumen y motivo del cambio.
2. Archivos afectados.
3. Pruebas ejecutadas y su resultado.
4. Documentación actualizada.
5. Confirmación de que no incluye secretos ni datos personales.

Un Pull Request pequeño y enfocado en un solo tema se revisa antes que uno grande.
El propietario puede pedir cambios: es parte normal del proceso.

## Informar de errores o proponer ideas

Usa las plantillas de **Issues** del repositorio: *Informe de error* o *Propuesta de funcionalidad*.
Para vulnerabilidades de seguridad **no abras un issue público**: sigue [SECURITY.md](SECURITY.md).
