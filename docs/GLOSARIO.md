# Glosario

Conceptos que aparecen en VITIDEV IA OS, explicados para quien empieza. Cada entrada indica,
cuando aplica, dónde se ve el concepto dentro del proyecto.

## Inteligencia artificial y agentes

### Inteligencia artificial (IA)
Campo de la informática que crea sistemas capaces de realizar tareas que asociamos con la
inteligencia humana: entender texto, reconocer imágenes, razonar o planificar.
*Ejemplo:* un traductor automático o un asistente que resume un documento.

### Modelo de lenguaje
Programa entrenado con enormes cantidades de texto para predecir qué palabra (o fragmento) viene
después. Esa capacidad le permite redactar, resumir, responder preguntas o escribir código.

### LLM
Siglas de *Large Language Model*, "modelo de lenguaje grande". Es un modelo de lenguaje con miles
de millones de parámetros, como los modelos Claude. VITIDEV IA OS **no es un LLM**: lo utiliza a
través de Claude Code u OpenCode.

### Agente de IA
Un LLM que, además de responder, puede **usar herramientas** (leer archivos, buscar en la web,
ejecutar comandos) para cumplir un objetivo en varios pasos.
*Ejemplo:* pides "crea un proyecto" y el agente crea la carpeta, escribe la ficha y la registra
en la memoria.

### Agente autónomo
Agente que decide y ejecuta una secuencia larga de acciones con poca o ninguna supervisión humana.
VITIDEV IA OS **no es autónomo por diseño**: pide aprobación antes de cambiar datos existentes y
sus subagentes (`tutor`, `investigador`, `project-manager`) solo pueden leer.

### Subagente
Agente especializado al que el agente principal delega una tarea concreta. Trabaja con su propio
contexto y devuelve un resultado. En el proyecto: `.claude/agents/`.

### Skill
Archivo Markdown con un procedimiento que el agente sigue para un tipo de tarea: objetivo,
cuándo usarlo, pasos, reglas y resultado esperado. Es una forma de "enseñar" un método al agente
sin programar. En el proyecto: `.claude/skills/<nombre>/SKILL.md`.
*Ejemplo:* la skill `investigar` obliga a citar fuentes y guardar un informe.

### Herramientas (*tools*)
Acciones concretas que un agente puede ejecutar: leer un archivo (Read), editarlo (Edit),
ejecutar un comando (Bash), buscar en la web (WebSearch). Los permisos deciden cuáles se permiten,
cuáles requieren confirmación y cuáles se bloquean.

### MCP
*Model Context Protocol*: estándar abierto para conectar agentes con herramientas y fuentes de datos
externas (calendarios, bases de datos, servicios). VITIDEV IA OS **no usa MCP**: funciona solo con
archivos locales (decisión D1 en [decisiones.md](decisiones.md)). Más información en
[modelcontextprotocol.io](https://modelcontextprotocol.io).

## Contexto y memoria

### Prompt
El texto que se envía al modelo para pedirle algo.
*Ejemplo:* "Explícame la recursividad con un ejemplo en Python".

### System prompt
Instrucciones que recibe el modelo **antes** de la conversación y que definen su papel y sus reglas.
En el proyecto, `AGENTS.md` y las reglas de `.claude/rules/` forman parte de ese contexto inicial.

### Contexto
Toda la información que el modelo tiene disponible al responder: system prompt, memoria cargada,
mensajes de la conversación y archivos leídos. El modelo **solo sabe lo que está en su contexto**.

### Context window (ventana de contexto)
Cantidad máxima de texto, medida en tokens, que el modelo puede tener en cuenta a la vez. Por eso
VITIDEV IA OS solo carga al iniciar lo imprescindible (perfil, preferencias, objetivos y proyectos
activos) y lee el resto bajo demanda.

### Token
Unidad en la que el modelo divide el texto. Suele ser una palabra corta o un fragmento de palabra.
El tamaño del contexto y el coste de uso se miden en tokens.
*Ejemplo:* "recursividad" puede dividirse en varios tokens.

### Memoria
Información que sobrevive entre sesiones. Los modelos no recuerdan conversaciones anteriores por sí
mismos; VITIDEV IA OS guarda lo importante en archivos de `memoria/` y los vuelve a cargar en cada
sesión. Detalle en [Privacidad y memoria](PRIVACIDAD-Y-MEMORIA.md).

## Formatos de archivo

### Markdown
Formato de texto con marcas sencillas para dar estructura: `#` para títulos, `-` para listas,
`**negrita**`. Lo leen igual de bien las personas y los modelos. Casi todo el proyecto es Markdown.

### YAML
Formato para escribir datos como pares `clave: valor`. En el proyecto aparece como *frontmatter*:
el bloque entre `---` al principio de skills, agentes y archivos de memoria.

```yaml
---
name: aprender
description: Enseña un concepto adaptándose al nivel del usuario.
---
```

### JSON
Formato de datos con llaves, corchetes y comillas, muy usado en configuración.
En el proyecto: `opencode.json`, `.claude/settings.json` y `package.json`.

```json
{ "permission": { "bash": { "rm -rf *": "deny" } } }
```

## Herramientas de desarrollo

### CLI
*Command Line Interface*, interfaz de línea de comandos: un programa que se usa escribiendo órdenes
en la terminal. Claude Code (`claude`), OpenCode (`opencode`), Node.js (`node`) y git son CLI.

### API
*Application Programming Interface*: forma acordada en que un programa pide servicios a otro.
Las herramientas de agentes se comunican con los modelos a través de la API del proveedor, que
suele requerir una **clave de API** para identificarte y facturar el uso.

### Variable de entorno
Valor con nombre que el sistema operativo pasa a los programas, fuera del código.
Se usan para configuración y secretos, para no escribirlos en archivos del proyecto.
*Ejemplo:* `OPENCODE_DISABLE_CLAUDE_CODE=1` hace que OpenCode no lea la configuración global de
Claude Code.

### Git
Sistema de control de versiones: registra cada cambio de los archivos para poder revisarlo,
deshacerlo o combinarlo con el trabajo de otras personas. Aprende más en [git-scm.com](https://git-scm.com).

### GitHub
Plataforma web para alojar repositorios git y colaborar: issues, Pull Requests y revisiones.
Este proyecto se publica en GitHub.

### Fork
Copia de un repositorio en tu propia cuenta de GitHub. Puedes cambiarla libremente y, si quieres,
proponer tus cambios al original con un Pull Request.

### Pull Request
Solicitud para incorporar los cambios de una rama (normalmente de tu fork) al repositorio original.
Incluye una descripción, los cambios y un espacio para revisarlos. Ver [CONTRIBUTING.md](../CONTRIBUTING.md).

## Organización del trabajo

### Automatización
Hacer que una tarea ocurra sola cuando se cumple una condición. En el proyecto, los **hooks** de
Claude Code y el **plugin** de OpenCode son automatizaciones: al iniciar la sesión añaden un resumen
de estado y antes de cada acción comprueban si es peligrosa.

### Hook
Programa que la herramienta ejecuta automáticamente en un momento concreto (al iniciar la sesión,
antes de usar una herramienta). En el proyecto: `.claude/hooks/`.

### Flujo de trabajo
Secuencia ordenada de pasos para lograr un resultado. Los comandos del proyecto son flujos de trabajo.
*Ejemplo:* `/estudiar` sigue el flujo diagnóstico → plan → explicación → práctica → registro del aprendizaje.
