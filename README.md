<p align="center">
  <img src="BANNER.jpg" width="100%" alt="VITIDEV IA OS - Tu espacio de trabajo inteligente con agentes de IA">
</p>

<h1 align="center">VITIDEV IA OS</h1>

<p align="center">
  <b>Sistema personal de trabajo inteligente basado en agentes de IA</b><br>
  Compatible con Claude Code y OpenCode. Integra contexto, memoria persistente, habilidades,
  agentes especializados y comandos personalizados.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/versión-1.0.0-8B5CF6?style=for-the-badge&labelColor=0D0D12" alt="Versión 1.0.0">
  <img src="https://img.shields.io/badge/estado-funcional_y_probado-6B21A8?style=for-the-badge&labelColor=0D0D12" alt="Estado: funcional y probado">
  <a href="LICENSE"><img src="https://img.shields.io/badge/licencia-MIT-D4AF37?style=for-the-badge&labelColor=0D0D12" alt="Licencia MIT"></a>
</p>

<p align="center">
  <a href="https://code.claude.com/docs/en/overview"><img src="https://img.shields.io/badge/Claude_Code-2.1.x-D97757?style=for-the-badge&logo=claude&logoColor=white&labelColor=0D0D12" alt="Claude Code 2.1.x"></a>
  <a href="https://opencode.ai/docs/"><img src="https://img.shields.io/badge/OpenCode-V1_(1.x)-C0C0C8?style=for-the-badge&logo=opencode&logoColor=white&labelColor=0D0D12" alt="OpenCode V1"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-%3E%3D20-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white&labelColor=0D0D12" alt="Node.js 20 o superior"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/pruebas-30_superadas-1E3A8A?style=flat-square&labelColor=0D0D12" alt="30 pruebas superadas">
  <img src="https://img.shields.io/badge/dependencias-0-1E3A8A?style=flat-square&labelColor=0D0D12" alt="Sin dependencias">
  <img src="https://img.shields.io/badge/skills-10-8B5CF6?style=flat-square&labelColor=0D0D12" alt="10 skills">
  <img src="https://img.shields.io/badge/agentes-3-8B5CF6?style=flat-square&labelColor=0D0D12" alt="3 agentes">
  <img src="https://img.shields.io/badge/comandos-6-8B5CF6?style=flat-square&labelColor=0D0D12" alt="6 comandos">
  <img src="https://img.shields.io/badge/idioma-español-D4AF37?style=flat-square&labelColor=0D0D12" alt="Idioma español">
</p>

<p align="center">
  <a href="#sobre-el-proyecto">Sobre el proyecto</a> &nbsp;|&nbsp;
  <a href="#arquitectura">Arquitectura</a> &nbsp;|&nbsp;
  <a href="#instalación">Instalación</a> &nbsp;|&nbsp;
  <a href="#uso-básico">Uso básico</a> &nbsp;|&nbsp;
  <a href="#skills-y-agentes">Skills y agentes</a> &nbsp;|&nbsp;
  <a href="#memoria">Memoria</a> &nbsp;|&nbsp;
  <a href="#privacidad-y-seguridad">Seguridad</a> &nbsp;|&nbsp;
  <a href="#documentación">Documentación</a> &nbsp;|&nbsp;
  <a href="#roadmap">Roadmap</a> &nbsp;|&nbsp;
  <a href="#contribuciones">Contribuir</a>
</p>

---

## Sobre el proyecto

**VITIDEV IA OS** convierte una herramienta de agentes de IA en un **asistente personal que te conoce,
recuerda y organiza tu trabajo**. No es un sistema operativo tradicional: es un entorno de trabajo
basado en archivos (Markdown y JSON) que Claude Code y OpenCode cargan al abrir la carpeta.

<table>
<tr>
<td width="50%" valign="top">

### El problema

Un chatbot tradicional **empieza de cero en cada conversación**: no sabe quién eres, qué estudias,
qué proyectos tienes ni cómo prefieres trabajar. Lo que aprendes o decides se pierde en el
historial, y lo que configuras queda atado a una sola herramienta o proveedor.

</td>
<td width="50%" valign="top">

### La solución

Un núcleo de archivos compartido que aporta **identidad, memoria persistente, procedimientos
especializados y reglas de seguridad**. Funciona igual en Claude Code y en OpenCode, con el
modelo y el proveedor que cada persona elija.

</td>
</tr>
</table>

| | Chatbot tradicional | VITIDEV IA OS |
|---|---|---|
| **Contexto** | Hay que repetirlo en cada conversación | Perfil, preferencias, objetivos y proyectos cargados al iniciar |
| **Memoria** | Se pierde al cerrar el chat | Archivos Markdown persistentes, legibles y editables |
| **Método** | Respuestas genéricas | Skills con procedimientos y agentes especializados |
| **Control** | Sin límites explícitos | Permisos y bloqueo de acciones peligrosas |
| **Portabilidad** | Atado a una plataforma | Claude Code y OpenCode sobre los mismos archivos |
| **Datos** | En el historial del proveedor | En tu disco, en texto plano |

**Qué no es:** no es un modelo de IA ni una aplicación con interfaz propia. Funciona dentro de
Claude Code u OpenCode, con el modelo que elijas.

**Para quién está diseñado:** estudiantes, docentes y profesionales que quieren un asistente que
acompañe su estudio, sus investigaciones y sus proyectos a lo largo del tiempo, y para talleres
educativos sobre agentes de IA (incluye una [guía de taller de 2 horas](docs/guia-taller.md)).

---

## Características principales

<table>
<tr>
<td width="25%" valign="top">

**Contexto e identidad**

`AGENTS.md` define quién es el agente y cómo trabaja. Al iniciar, carga quién eres tú desde la memoria.

</td>
<td width="25%" valign="top">

**Memoria persistente**

Perfil, objetivos, proyectos activos, pausados y finalizados, aprendizajes y sesiones en `memoria/`.

</td>
<td width="25%" valign="top">

**Skills**

10 procedimientos con objetivo, pasos, reglas y resultado esperado: aprender, investigar, organizar y más.

</td>
<td width="25%" valign="top">

**Agentes especializados**

`tutor`, `investigador` y `project-manager`: subagentes de solo lectura que preparan y analizan.

</td>
</tr>
<tr>
<td width="25%" valign="top">

**Comandos personalizados**

`/conocerme`, `/estudiar`, `/investigar`, `/guardar`, `/revisar-proyectos` y `/cerrar-sesion`.

</td>
<td width="25%" valign="top">

**Automatizaciones y hooks**

Resumen de estado al iniciar (plazos, repasos, pendientes) y protección en tiempo real.

</td>
<td width="25%" valign="top">

**Seguridad**

Tres capas: instrucciones, permisos y bloqueo de secretos y de comandos destructivos.

</td>
<td width="25%" valign="top">

**Organización del conocimiento**

`workspace/` para proyectos, universidad, investigaciones y entregables, con un inbox y un archivo.

</td>
</tr>
</table>

---

## Arquitectura

### 1. Arquitectura general

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#1a1a24','primaryTextColor':'#E5E5EA','primaryBorderColor':'#8B5CF6','lineColor':'#8B5CF6','secondaryColor':'#1E3A8A','tertiaryColor':'#0D0D12','clusterBkg':'#13131c','clusterBorder':'#6B21A8','fontFamily':'Segoe UI, Arial'}}}%%
flowchart TB
    U["Usuario"]

    subgraph HERRAMIENTAS["Herramientas de agentes"]
        CC["Claude Code"]
        OC["OpenCode"]
    end

    subgraph ADAPTADORES["Adaptadores por herramienta"]
        CCA["CLAUDE.md<br/>.claude/settings.json<br/>hooks SessionStart y PreToolUse"]
        OCA["opencode.json<br/>.opencode/commands y agents<br/>plugin vitidev.js"]
    end

    subgraph NUCLEO["Núcleo compartido - una sola copia"]
        AG["AGENTS.md<br/>instrucciones centrales"]
        RU[".claude/rules<br/>seguridad, memoria, workspace, estilo"]
        SK[".claude/skills<br/>10 skills"]
        AP[".claude/agents<br/>prompts de los 3 agentes"]
        LB[".claude/hooks/lib<br/>reglas.mjs y estado.mjs"]
    end

    subgraph DATOS["Datos del usuario"]
        ME[("memoria/")]
        WS[("workspace/")]
    end

    U --> CC & OC
    CC --> CCA
    OC --> OCA
    CCA --> NUCLEO
    OCA --> NUCLEO
    NUCLEO --> DATOS
```

### 2. Flujo de funcionamiento del agente

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#1a1a24','primaryTextColor':'#E5E5EA','primaryBorderColor':'#8B5CF6','lineColor':'#8B5CF6','actorBkg':'#1a1a24','actorBorder':'#8B5CF6','actorTextColor':'#E5E5EA','signalColor':'#8B5CF6','signalTextColor':'#C0C0C8','noteBkgColor':'#1E3A8A','noteTextColor':'#E5E5EA','noteBorderColor':'#D4AF37','labelBoxBkgColor':'#13131c','labelTextColor':'#E5E5EA','loopTextColor':'#C0C0C8','fontFamily':'Segoe UI, Arial'}}}%%
sequenceDiagram
    autonumber
    actor U as Usuario
    participant A as Agente principal
    participant S as Skill
    participant G as Subagente
    participant P as Protección
    participant M as memoria/

    Note over A,M: Al iniciar: AGENTS.md + perfil, preferencias,<br/>objetivos y proyectos activos + resumen de estado
    U->>A: /estudiar recursividad 20
    A->>S: Carga el procedimiento de la skill estudiar
    A->>M: Lee preferencias y aprendizajes previos
    A->>G: Delega en tutor la preparación del material
    G-->>A: Plan, explicación por capas y ejercicios
    A->>U: Imparte la sesión y hace preguntas
    U->>A: Responde y acepta guardar el aprendizaje
    A->>P: Solicita escribir en memoria/aprendizajes
    P-->>A: Permitido: dentro del proyecto, sin secretos
    A->>M: Registra el aprendizaje y su fecha de repaso
    A->>U: Confirma qué se guardó y dónde
```

### 3. Relación entre memoria, contexto, skills y agentes

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#1a1a24','primaryTextColor':'#E5E5EA','primaryBorderColor':'#8B5CF6','lineColor':'#8B5CF6','clusterBkg':'#13131c','clusterBorder':'#6B21A8','fontFamily':'Segoe UI, Arial'}}}%%
flowchart LR
    subgraph CONTEXTO["Contexto cargado al iniciar"]
        P1["perfil.md"]
        P2["preferencias.md"]
        P3["objetivos.md"]
        P4["proyectos/activos.md"]
        ES["Resumen de estado"]
    end

    subgraph SKILLS["Skills de capacidad"]
        S1["aprender"]
        S2["investigar"]
        S3["organizar"]
        S4["crear-proyecto"]
        S5["gestionar-memoria"]
    end

    subgraph AGENTES["Subagentes de solo lectura"]
        T["tutor"]
        I["investigador"]
        PM["project-manager"]
    end

    subgraph ALMACEN["Almacenamiento"]
        MEM[("memoria/")]
        WSP[("workspace/")]
    end

    CONTEXTO --> SKILLS
    S1 -.-> T
    S2 -.-> I
    S4 -.-> PM
    S1 & S3 & S4 & S5 -->|"escribe con aprobación"| MEM
    S2 & S3 & S4 -->|"crea y ordena"| WSP
    T & I & PM -->|"solo lectura"| MEM
    MEM -->|"se recarga en la siguiente sesión"| CONTEXTO
```

### 4. Compatibilidad Claude Code / OpenCode

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#1a1a24','primaryTextColor':'#E5E5EA','primaryBorderColor':'#8B5CF6','lineColor':'#8B5CF6','clusterBkg':'#13131c','clusterBorder':'#6B21A8','fontFamily':'Segoe UI, Arial'}}}%%
flowchart LR
    subgraph CLAUDE["Claude Code"]
        C1["CLAUDE.md<br/>importa @AGENTS.md y @memoria"]
        C2["Skills /comando nativas"]
        C3[".claude/agents"]
        C4["Hooks PreToolUse y SessionStart"]
    end

    subgraph COMUN["Compartido"]
        X1["AGENTS.md"]
        X2[".claude/skills"]
        X3["Prompts de agentes"]
        X4["reglas.mjs y estado.mjs"]
        X5[("memoria/")]
    end

    subgraph OPEN["OpenCode V1"]
        O1["AGENTS.md automático<br/>memoria vía instructions"]
        O2[".opencode/commands"]
        O3[".opencode/agents generados"]
        O4["Plugin vitidev.js"]
    end

    C1 --> X1
    O1 --> X1
    C2 --> X2
    O2 --> X2
    C3 --> X3
    X3 -->|"npm run sincronizar"| O3
    C4 --> X4
    O4 --> X4
    C1 & O1 --> X5
```

---

## Tecnologías utilizadas

<p align="center">
  <a href="https://code.claude.com/docs/en/overview"><img src="https://cdn.simpleicons.org/claude/D97757" width="48" height="48" alt="Claude Code"></a>
  &nbsp;&nbsp;
  <a href="https://opencode.ai"><img src="https://cdn.simpleicons.org/opencode/C0C0C8" width="48" height="48" alt="OpenCode"></a>
  &nbsp;&nbsp;
  <a href="https://skillicons.dev"><img src="https://skillicons.dev/icons?i=nodejs,js,md,github&theme=dark" height="48" alt="Node.js, JavaScript, Markdown y GitHub"></a>
  &nbsp;&nbsp;
  <a href="https://www.json.org"><img src="https://cdn.simpleicons.org/json/C0C0C8" width="48" height="48" alt="JSON"></a>
  &nbsp;&nbsp;
  <a href="https://mermaid.js.org"><img src="https://cdn.simpleicons.org/mermaid/FF3670" width="48" height="48" alt="Mermaid"></a>
</p>

| Tecnología | Uso en el proyecto | Documentación |
|---|---|---|
| <img src="https://cdn.simpleicons.org/claude/D97757" width="16"> **Claude Code** | Herramienta de agentes: `CLAUDE.md`, skills, subagentes, hooks y permisos | [code.claude.com/docs](https://code.claude.com/docs/en/overview) |
| <img src="https://cdn.simpleicons.org/opencode/C0C0C8" width="16"> **OpenCode** | Herramienta de agentes: `AGENTS.md`, `opencode.json`, agentes, comandos y plugin | [opencode.ai/docs](https://opencode.ai/docs/) |
| <img src="https://cdn.simpleicons.org/nodedotjs/5FA04E" width="16"> **Node.js** | Hooks, plugin, validador, sincronización y pruebas con `node:test` | [nodejs.org](https://nodejs.org) |
| <img src="https://cdn.simpleicons.org/javascript/F7DF1E" width="16"> **JavaScript (ESM)** | Lenguaje de los scripts `.mjs` y del plugin `.js` | [nodejs.org/api/esm](https://nodejs.org/api/esm.html) |
| <img src="https://cdn.simpleicons.org/markdown/C0C0C8" width="16"> **Markdown** | Instrucciones, reglas, skills, agentes, memoria y documentación | [commonmark.org](https://commonmark.org) |
| <img src="https://cdn.simpleicons.org/json/C0C0C8" width="16"> **JSON** | `opencode.json`, `.claude/settings.json` y `package.json` | [json.org](https://www.json.org) |
| <img src="https://cdn.simpleicons.org/mermaid/FF3670" width="16"> **Mermaid** | Diagramas de esta documentación | [mermaid.js.org](https://mermaid.js.org) |

El proyecto no tiene dependencias: `package.json` solo define scripts, y todo usa la biblioteca
estándar de Node.js.

---

## Estructura del proyecto

```text
VITIDEV-AI-OS/
├── AGENTS.md                    Instrucciones centrales (fuente única para ambas herramientas)
├── CLAUDE.md                    Claude Code: importa AGENTS.md y la memoria
├── opencode.json                OpenCode: memoria, reglas, skills y permisos (sin modelo fijo)
├── BANNER.jpg                   Banner del proyecto
├── package.json                 Scripts: test, validar, sincronizar, probar:opencode
├── LICENSE                      Licencia MIT
├── CONTRIBUTING.md              Cómo contribuir
├── SECURITY.md                  Política de seguridad
├── CODE_OF_CONDUCT.md           Código de conducta
├── CHANGELOG.md                 Historial de versiones
├── .github/                     Plantillas de issues y Pull Request
├── .claude/
│   ├── settings.json            Permisos y registro de hooks de Claude Code
│   ├── rules/                   seguridad.md, memoria.md, workspace.md, estilo.md
│   ├── skills/                  10 skills compartidas (SKILL.md + plantillas)
│   ├── agents/                  tutor.md, investigador.md, project-manager.md (fuente)
│   └── hooks/
│       ├── session-start.mjs    Hook SessionStart: resumen de estado
│       ├── proteger.mjs         Hook PreToolUse: protección
│       └── lib/                 reglas.mjs, estado.mjs, opencode.mjs (lógica compartida)
├── .opencode/
│   ├── agents/                  Agentes generados desde .claude/agents
│   ├── commands/                6 comandos personalizados
│   └── plugins/vitidev.js       Protección y resumen de estado en OpenCode
├── memoria/                     Memoria persistente compartida
│   ├── personal/                perfil.md, preferencias.md
│   ├── objetivos.md
│   ├── proyectos/               activos.md, pausados.md, finalizados.md
│   ├── aprendizajes/            Un archivo por tema + INDICE.md
│   ├── sesiones/                Un registro por día
│   └── inbox.md                 Datos pendientes de clasificar
├── workspace/                   proyectos/, universidad/, investigaciones/, entregables/, inbox/, _archivo/
├── scripts/                     validar.mjs, sincronizar-agentes.mjs, probar-opencode.mjs
├── tests/                       30 pruebas automáticas
└── docs/                        Guías, FAQ, glosario, privacidad, decisiones, limitaciones y taller
```

Explicación de cada carpeta, qué se puede modificar y con qué precauciones:
[docs/ESTRUCTURA-DEL-PROYECTO.md](docs/ESTRUCTURA-DEL-PROYECTO.md).

| Componente | Responsabilidad |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Identidad del agente, mapa del sistema, forma de trabajar y reglas no negociables |
| [`.claude/skills/`](.claude/skills) | Procedimientos reutilizables; una sola copia para las dos herramientas |
| [`.claude/hooks/lib/`](.claude/hooks/lib) | Lógica de protección y de estado que usan el hook de Claude Code y el plugin de OpenCode |
| [`memoria/`](memoria) | Lo que debe sobrevivir entre sesiones |
| [`workspace/`](workspace) | Los archivos de trabajo del usuario |
| [`scripts/validar.mjs`](scripts/validar.mjs) | Comprueba estructura, referencias y coherencia entre ambas implementaciones |

---

## Compatibilidad

<table>
<tr>
<td align="center" width="50%">
  <img src="https://cdn.simpleicons.org/claude/D97757" width="56" alt="Claude Code"><br>
  <b>Claude Code</b><br>
  <sub>Versión 2.1.x &middot; probado con 2.1.319</sub>
</td>
<td align="center" width="50%">
  <img src="https://cdn.simpleicons.org/opencode/C0C0C8" width="56" alt="OpenCode"><br>
  <b>OpenCode V1</b><br>
  <sub>Versión 1.x &middot; probado con 1.18.32 y un modelo real</sub>
</td>
</tr>
</table>

| Elemento | Claude Code | OpenCode V1 |
|---|---|---|
| **Instrucciones** | `CLAUDE.md` importa `@AGENTS.md` | `AGENTS.md` se carga automáticamente |
| **Memoria inicial** | Imports `@memoria/...` en `CLAUDE.md` | Campo `instructions` de `opencode.json` |
| **Reglas** | `.claude/rules/` (nativo) | Campo `instructions` de `opencode.json` |
| **Skills** | `.claude/skills/` (nativo) | `.claude/skills/` (nativo y en `skills.paths`) |
| **Agentes** | `.claude/agents/*.md` con `tools` | `.opencode/agents/*.md` con `mode: subagent` y `permission` |
| **Comandos** | Skills invocables con `/nombre` | `.opencode/commands/*.md` que cargan la skill |
| **Configuración** | `.claude/settings.json` | `opencode.json` |
| **Protección** | Hook `PreToolUse` | Plugin `tool.execute.before` |
| **Estado inicial** | Hook `SessionStart` | Plugin `experimental.chat.system.transform` |
| **Modelo** | Cuenta de Claude o clave de API | Cualquier proveedor compatible, incluidos modelos gratuitos |

> **OpenCode V2** está en beta. Según la [guía oficial de migración](https://opencode.ai/docs/migrate-v1/),
> V2 lee el formato V1 usado aquí, pero no ejecuta plugins de V1. No se ha probado con V2:
> ver [limitaciones](docs/limitaciones.md).

---

## Instalación

Guía completa paso a paso, con comandos para Windows PowerShell, Linux y macOS:
[docs/PRIMEROS-PASOS.md](docs/PRIMEROS-PASOS.md).

### Requisitos

| Requisito | Versión | Notas |
|---|---|---|
| [Node.js](https://nodejs.org) | 20 o superior | Hooks, plugin, validador y pruebas. Sin dependencias que instalar |
| [Claude Code](https://code.claude.com/docs/en/setup) | 2.1.x | Requiere suscripción de Claude o clave de la API de Anthropic |
| [OpenCode](https://opencode.ai/docs/) | 1.x (V1) | Admite modelos gratuitos. **V2 no está probado** y no ejecuta el plugin de protección |
| [Git](https://git-scm.com) | Cualquiera reciente | Recomendado para clonar y actualizar |

Basta con **una** de las dos herramientas. Verificado en Windows 11; Linux y macOS están
soportados por diseño, pero sin verificar.

### Instalación rápida

```bash
git clone https://github.com/VITIDEV06/VITIDEV-AI-OS.git
cd VITIDEV-AI-OS
npm test
```

Sin git: en la página del repositorio, **Code → Download ZIP**, descomprime y abre una terminal en
la carpeta `VITIDEV-AI-OS-master`. `npm test` debe terminar con `fail 0`.

<table>
<tr>
<td width="50%" valign="top">

### Con Claude Code

**1. Instalar Claude Code** ([documentación](https://code.claude.com/docs/en/overview))

```bash
npm install -g @anthropic-ai/claude-code
```

**2. Abrir la carpeta** e iniciar sesión con tu cuenta

```bash
claude
```

**3. Primer uso**

- Acepta confiar en la carpeta y sus hooks.
- Escribe `/` para ver los comandos.
- Ejecuta `/agents` para ver los 3 agentes.
- Ejecuta `/conocerme`.

</td>
<td width="50%" valign="top">

### Con OpenCode

**1. Instalar OpenCode** ([documentación](https://opencode.ai/docs/))

```bash
npm install -g opencode-ai
```

**2. Configurar tu proveedor** (fuera del proyecto)

```bash
opencode auth login
```

**3. Comprobar el proyecto** (sin usar ningún modelo)

```bash
npm run probar:opencode
```

**4. Abrir la carpeta**

```bash
opencode
```

**5. Primer uso**

- Escribe `/` para ver los comandos.
- Escribe `@` para ver los agentes.
- Ejecuta `/conocerme`.

</td>
</tr>
</table>

**Modelos y proveedores.** El proyecto no fija modelo, proveedor ni credenciales. En Claude Code
se cambia con `/model`. En OpenCode, con `/models` o `opencode -m proveedor/modelo`; para un modelo
por defecto, usa tu configuración global `~/.config/opencode/opencode.json`. OpenCode ofrece
modelos gratuitos con el prefijo `opencode/` (`opencode models` los lista). Más detalles en la
documentación de [proveedores de OpenCode](https://opencode.ai/docs/providers/).

### Configuración

No hace falta configurar nada para empezar: no hay archivos `.env` ni claves en el proyecto.

| Qué | Dónde |
|---|---|
| Tu identidad, preferencias y objetivos | `/conocerme`, o a mano en `memoria/personal/` y `memoria/objetivos.md` |
| Modelo y credenciales | En la herramienta (`/model`, `/models`, `opencode auth login`), nunca en el proyecto |
| Estilo de las respuestas | `memoria/personal/preferencias.md` |
| Instrucciones, skills, agentes y permisos | Ver [Personalización](#personalización) |

### Actualizar

```bash
git pull
npm test
```

Haz antes una copia de `memoria/`: si git informa de conflictos en esos archivos, conserva tu
versión. Si descargaste el ZIP, descarga la versión nueva y copia en ella tus carpetas `memoria/`
y `workspace/`. Revisa el [CHANGELOG](CHANGELOG.md) antes de actualizar.

---

## Uso básico

Una sesión típica:

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#1a1a24','primaryTextColor':'#E5E5EA','primaryBorderColor':'#8B5CF6','lineColor':'#8B5CF6','fontFamily':'Segoe UI, Arial'}}}%%
flowchart LR
    A["Abrir claude<br/>u opencode"] --> B["Resumen de estado:<br/>plazos, repasos, pendientes"]
    B --> C["Trabajar: /estudiar,<br/>/investigar, proyectos"]
    C --> D["/guardar lo importante"]
    D --> E["/cerrar-sesion"]
    E -->|"la siguiente vez"| A
```

### Comandos

Los comandos los lanza el usuario; el agente no los ejecuta por iniciativa propia. Tienen el mismo
nombre y comportamiento en ambas herramientas.

| Comando | Función | Usa | Ejemplo |
|---|---|---|---|
| `/conocerme` | Entrevista por bloques y completa perfil, preferencias y objetivos | `gestionar-memoria` | `/conocerme completo` |
| `/estudiar` | Diagnóstico, plan, explicación, práctica y registro del aprendizaje | `tutor`, `aprender` | `/estudiar recursividad 20` |
| `/investigar` | Investigación con fuentes citadas e informe en `workspace/investigaciones/` | `investigador` | `/investigar ¿qué es el repaso espaciado?` |
| `/guardar` | Guarda un dato en el archivo de memoria correcto | `gestionar-memoria` | `/guardar prefiero ejemplos antes que teoría` |
| `/revisar-proyectos` | Estado de los proyectos, prioridades de la semana y cambios de estado | `project-manager` | `/revisar-proyectos` |
| `/cerrar-sesion` | Resume la sesión, actualiza memoria y proyectos y deja próximos pasos | `gestionar-memoria` | `/cerrar-sesion` |

```text
/conocerme
/crear-proyecto Taller de IA
/estudiar derivadas parciales 25
¿Qué sabes de mí?
/cerrar-sesion
```

OpenCode también permite ejecutarlos sin interfaz:

```bash
opencode run --command guardar "prefiero respuestas breves"
```

---

## Skills y agentes

### Skills

Cada skill vive una sola vez en `.claude/skills/<nombre>/SKILL.md` y la usan las dos herramientas.
Todas tienen nombre, descripción, **Objetivo**, **Procedimiento**, **Reglas** y **Resultado esperado**.

| Skill | Tipo | Se activa cuando el usuario… | Resultado |
|---|---|---|---|
| `aprender` | Capacidad | pide "explícame", "no entiendo", "quiero aprender" | Explicación por capas, comprobación y registro en `memoria/aprendizajes/` |
| `investigar` | Capacidad | pide "investiga", "busca información", "compara" | Síntesis con fuentes e informe en `workspace/investigaciones/` |
| `organizar` | Capacidad | pide "organiza", "ordena", "clasifica" | Plan de clasificación; mueve con aprobación y nunca borra |
| `crear-proyecto` | Capacidad | dice "nuevo proyecto", "quiero empezar…" | Carpeta, ficha `PROYECTO.md` y registro en `activos.md` |
| `gestionar-memoria` | Capacidad | dice "recuerda", "¿qué sabes de mí?", "olvida" | Dato en su archivo; cambios solo con aprobación |
| `conocerme`, `estudiar`, `guardar`, `revisar-proyectos`, `cerrar-sesion` | Comando | lanza el comando | Ver [Comandos](#uso-básico) |

### Agentes

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#1a1a24','primaryTextColor':'#E5E5EA','primaryBorderColor':'#8B5CF6','lineColor':'#8B5CF6','fontFamily':'Segoe UI, Arial'}}}%%
flowchart LR
    A["Agente principal<br/>conversa y escribe con aprobación"]
    A -->|"/estudiar"| T["tutor<br/>material didáctico"]
    A -->|"/investigar"| I["investigador<br/>fuentes y síntesis"]
    A -->|"/revisar-proyectos"| P["project-manager<br/>auditoría y prioridades"]
    T & I & P -->|"informe"| A
```

| Agente | Especialidad | Permisos | Invocación |
|---|---|---|---|
| `tutor` | Planes de estudio, explicaciones por capas, ejercicios con solución | Lectura, búsqueda y lectura web | `/estudiar`, o `@tutor` en OpenCode |
| `investigador` | Búsqueda, evaluación de fuentes, contraste y síntesis citada | Lectura, búsqueda y lectura web | `/investigar`, o `@investigador` en OpenCode |
| `project-manager` | Avance, plazos, bloqueos, coherencia y prioridades | Solo lectura | `/revisar-proyectos`, o `@project-manager` en OpenCode |

Los tres heredan el modelo de la sesión y **no pueden escribir ni ejecutar comandos**: preparan y
proponen, y el agente principal aplica lo que el usuario aprueba. Los agentes de OpenCode se generan
a partir de los de Claude Code con `npm run sincronizar`.

---

## Memoria

Hay **una sola memoria**, la carpeta `memoria/`, compartida por ambas herramientas: lo que se guarda
con una se consulta con la otra.

| Categoría | Archivo | Se carga al iniciar |
|---|---|---|
| Información personal | `memoria/personal/perfil.md`, `preferencias.md` | Sí |
| Objetivos | `memoria/objetivos.md` | Sí |
| Proyectos activos | `memoria/proyectos/activos.md` | Sí |
| Proyectos pausados y finalizados | `memoria/proyectos/pausados.md`, `finalizados.md` | Bajo demanda |
| Aprendizajes | `memoria/aprendizajes/AAAA-MM-DD-tema.md` | Bajo demanda; el estado avisa de repasos |
| Sesiones | `memoria/sesiones/AAAA-MM-DD.md` | Se muestran los próximos pasos de la última |
| Sin clasificar | `memoria/inbox.md` | Bajo demanda |

| Operación | Cómo pedirla | Comportamiento |
|---|---|---|
| **Consultar** | "¿Qué sabes de mí?" | Busca en `memoria/` y cita el archivo; si no está, lo dice |
| **Guardar** | `/guardar <dato>` o "recuerda que…" | Clasifica y añade el dato en su archivo |
| **Actualizar** | "cambia mi…" | Muestra el valor anterior y el nuevo y espera aprobación |
| **Organizar** | `/organizar` | Reparte el inbox en su lugar, con aprobación |
| **Olvidar** | "olvida…" | Muestra qué se eliminará y pide confirmación |

Ciclo de vida de un proyecto:

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#1a1a24','primaryTextColor':'#E5E5EA','primaryBorderColor':'#8B5CF6','lineColor':'#8B5CF6','fontFamily':'Segoe UI, Arial'}}}%%
stateDiagram-v2
    [*] --> Activo: /crear-proyecto
    Activo --> Pausado: motivo de pausa y condición para retomar
    Pausado --> Activo: se retoma
    Activo --> Finalizado: resultado y lecciones aprendidas
    Pausado --> Finalizado: se cierra
    Finalizado --> [*]
```

Cada cambio de estado mueve la entrada entre `activos.md`, `pausados.md` y `finalizados.md`, y
actualiza la ficha `workspace/proyectos/<slug>/PROYECTO.md`.

---

## Personalización

| Quiero… | Cómo hacerlo |
|---|---|
| Cambiar cómo responde el agente | `memoria/personal/preferencias.md` (personal) o `.claude/rules/estilo.md` (por defecto) |
| Cambiar las instrucciones generales | Editar `AGENTS.md`: afecta a ambas herramientas |
| Crear una skill | Nueva carpeta `.claude/skills/<nombre>/SKILL.md` con las secciones obligatorias |
| Crear un agente | `.claude/agents/<nombre>.md` y después `npm run sincronizar` |
| Crear un comando en OpenCode | `.opencode/commands/<nombre>.md` que lea su skill y pase `$ARGUMENTS` |
| Añadir una regla | `.claude/rules/<tema>.md` y su ruta en `instructions` de `opencode.json` |
| Bloquear otro comando | Patrón en `COMANDOS_PROHIBIDOS` de `.claude/hooks/lib/reglas.mjs` |

### Cómo crear nuevas skills

Plantilla mínima de una skill:

```markdown
---
name: resumir-pdf
description: Resume un PDF en puntos clave. Úsala cuando el usuario pida "resume este PDF".
---

# Skill: resumir PDF

## Objetivo
## Cuándo activarse
## Procedimiento
## Reglas
## Resultado esperado
```

Después de cualquier cambio:

```bash
npm test
```

Documentación oficial de referencia: [skills de Claude Code](https://code.claude.com/docs/en/skills),
[subagentes](https://code.claude.com/docs/en/sub-agents), [hooks](https://code.claude.com/docs/en/hooks),
[skills de OpenCode](https://opencode.ai/docs/skills/), [agentes](https://opencode.ai/docs/agents/),
[comandos](https://opencode.ai/docs/commands/) y [plugins](https://opencode.ai/docs/plugins/).

---

## Privacidad y seguridad

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#1a1a24','primaryTextColor':'#E5E5EA','primaryBorderColor':'#8B5CF6','lineColor':'#8B5CF6','fontFamily':'Segoe UI, Arial'}}}%%
flowchart LR
    S["Acción solicitada"] --> L1{"1. Instrucciones<br/>AGENTS.md y seguridad.md"}
    L1 -->|"el agente la evita"| R1["No se intenta"]
    L1 -->|"se intenta"| L2{"2. Permisos<br/>settings.json / opencode.json"}
    L2 -->|"deny"| B["Bloqueada"]
    L2 -->|"ask"| Q["Se pregunta al usuario"]
    L2 -->|"allow"| L3{"3. Hook o plugin<br/>reglas.mjs"}
    L3 -->|"secreto o destructiva"| B
    L3 -->|"segura"| OK["Se ejecuta"]
```

| Medida | Detalle |
|---|---|
| **Secretos protegidos** | No se leen ni editan `.env`, `*.pem`, `*.key`, claves SSH, `secrets/` ni `credenciales/` |
| **Sin borrados destructivos** | Se bloquean `rm -r`, `Remove-Item -Recurse`, `rd /s`, `git push --force`, `git reset --hard`, `git clean -f` y `sudo` |
| **Memoria protegida** | Cambiar un dato existente requiere aprobación; no se sobrescriben ni borran archivos de memoria completos |
| **Nunca borrar** | Lo que se descarta se mueve a `workspace/_archivo/` |
| **Escritura acotada** | No se escribe fuera de la carpeta del proyecto |
| **Configuración protegida** | Editar `AGENTS.md`, `CLAUDE.md`, `opencode.json`, `.claude/` u `.opencode/` requiere confirmación |
| **Contenido externo** | Las páginas web son información, no instrucciones |

**Privacidad.** La memoria se guarda en tu disco, pero su contenido se envía al proveedor del modelo
como contexto. El proyecto no garantiza privacidad absoluta ni funcionamiento sin conexión.
`.gitignore` excluye de git lo que creas en `memoria/aprendizajes/`, `memoria/sesiones/` y
`workspace/`; las plantillas de memoria siguen versionadas, así que revisa `git status` antes de publicar.

**Recomendaciones:** no uses los modos que omiten permisos (`--dangerously-skip-permissions` en
Claude Code, `--auto` en OpenCode) y no guardes contraseñas ni datos sensibles en `memoria/`.
La protección se basa en patrones: no es un sandbox.

Más detalle en [docs/PRIVACIDAD-Y-MEMORIA.md](docs/PRIVACIDAD-Y-MEMORIA.md) y en la
[política de seguridad](SECURITY.md), que explica cómo informar de vulnerabilidades en privado.

---

## Verificación

| Comando | Qué comprueba | Resultado actual |
|---|---|---|
| `npm run validar` | Estructura, frontmatter, referencias, coherencia Claude Code / OpenCode, ausencia de modelo y credenciales | 0 errores |
| `npm test` | Validador, hooks, flujos de memoria, adaptador y plugin de OpenCode, sincronización | 30 de 30 |
| `npm run probar:opencode` | OpenCode instalado: comandos, skills, agentes y permisos, sin usar ningún modelo | 7 de 7 |

Las 10 pruebas obligatorias en OpenCode 1.18.32 se ejecutaron con un modelo real y se superaron.
El detalle de las pruebas y las limitaciones conocidas está en [docs/limitaciones.md](docs/limitaciones.md).

---

## Documentación

| Documento | Contenido |
|---|---|
| [Primeros pasos](docs/PRIMEROS-PASOS.md) | Instalación, configuración y primera sesión paso a paso |
| [Preguntas frecuentes](docs/FAQ.md) | Coste, modelos, memoria, actualización y solución de problemas |
| [Estructura del proyecto](docs/ESTRUCTURA-DEL-PROYECTO.md) | Cada carpeta y archivo: qué hace y si se puede modificar |
| [Privacidad y memoria](docs/PRIVACIDAD-Y-MEMORIA.md) | Qué se guarda, qué se envía al modelo y cómo limpiarlo |
| [Glosario](docs/GLOSARIO.md) | Conceptos de IA y desarrollo explicados con ejemplos |
| [Guía del taller](docs/guia-taller.md) | Taller de 2 horas para instructores y participantes |
| [Decisiones técnicas](docs/decisiones.md) | Por qué el sistema está diseñado así |
| [Limitaciones](docs/limitaciones.md) | Estado de verificación y limitaciones conocidas |

---

## Solución de problemas

| Síntoma | Solución |
|---|---|
| `node` o `npm` no se reconoce | Instala Node.js 20 o superior y abre una terminal nueva |
| PowerShell: "la ejecución de scripts está deshabilitada" | Usa `npm.cmd test` o el *Símbolo del sistema* |
| `npm test` falla tras editar un archivo | `npm run validar` indica el archivo y el motivo |
| No aparece un comando, skill o agente nuevo | Abre una sesión nueva: se cargan al iniciar |
| Claude Code no muestra el resumen de estado | Acepta confiar en la carpeta al abrir `claude` |
| El primer `opencode` se queda sin respuesta | Está instalando su SDK de plugins: espera o repítelo |
| "Bloqueado por seguridad: …" | Es intencionado: la acción tocaba un secreto o era destructiva |

Más casos en [docs/FAQ.md](docs/FAQ.md#solución-de-problemas).

---

## Contribuciones

Las contribuciones son bienvenidas: correcciones, documentación, skills, agentes y pruebas de
compatibilidad. Antes de empezar, lee:

- [CONTRIBUTING.md](CONTRIBUTING.md): fork, ramas, convenciones, pruebas y Pull Request.
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md): normas de convivencia.
- [SECURITY.md](SECURITY.md): cómo informar de vulnerabilidades sin publicarlas.

Los issues y Pull Requests usan plantillas que piden la información necesaria y recuerdan no incluir
secretos ni datos personales.

---

## Roadmap

| Estado | Funcionalidad |
|---|---|
| <img src="https://img.shields.io/badge/-implementado-6B21A8?style=flat-square" alt="Implementado"> | Contexto e identidad con `AGENTS.md` como fuente única |
| <img src="https://img.shields.io/badge/-implementado-6B21A8?style=flat-square" alt="Implementado"> | Memoria persistente compartida por categorías |
| <img src="https://img.shields.io/badge/-implementado-6B21A8?style=flat-square" alt="Implementado"> | 10 skills, 3 agentes y 6 comandos |
| <img src="https://img.shields.io/badge/-implementado-6B21A8?style=flat-square" alt="Implementado"> | Hooks de Claude Code y plugin de OpenCode V1 con la misma lógica |
| <img src="https://img.shields.io/badge/-implementado-6B21A8?style=flat-square" alt="Implementado"> | Validador, 30 pruebas automáticas y comprobación de OpenCode sin modelo |
| <img src="https://img.shields.io/badge/-implementado-6B21A8?style=flat-square" alt="Implementado"> | Licencia MIT, guías de contribución y seguridad, documentación educativa y plantillas de GitHub |
| <img src="https://img.shields.io/badge/-en_desarrollo-1E3A8A?style=flat-square" alt="En desarrollo"> | Verificación en una sesión nueva de Claude Code del import `@AGENTS.md` |
| <img src="https://img.shields.io/badge/-pendiente-3A3F4B?style=flat-square" alt="Pendiente"> | Verificación en Linux y macOS |
| <img src="https://img.shields.io/badge/-pendiente-3A3F4B?style=flat-square" alt="Pendiente"> | Compatibilidad probada con OpenCode V2 y plugin portado a su nuevo formato |
| <img src="https://img.shields.io/badge/-investigación_futura-0D0D12?style=flat-square" alt="Investigación futura"> | Búsqueda en la memoria más allá del texto literal (hoy se usa grep) |
| <img src="https://img.shields.io/badge/-investigación_futura-0D0D12?style=flat-square" alt="Investigación futura"> | Integraciones mediante MCP (calendario, gestores de tareas) sin perder la simplicidad actual |

Ninguna funcionalidad marcada como pendiente o de investigación futura está implementada.

---

## Licencia

<a href="LICENSE"><img src="https://img.shields.io/badge/licencia-MIT-D4AF37?style=for-the-badge&labelColor=0D0D12" alt="Licencia MIT"></a>

VITIDEV IA OS se distribuye bajo la [licencia MIT](LICENSE). Copyright (c) 2026 Victor Montes.

| Permite | Exige | No ofrece |
|---|---|---|
| Usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y vender copias, también con fines comerciales | Incluir el aviso de copyright y el texto de la licencia en todas las copias o partes sustanciales | Garantía de ningún tipo ni responsabilidad del autor |

La licencia cubre el contenido de este repositorio. Las herramientas y recursos de terceros que
utiliza o enlaza (Claude Code, OpenCode, Node.js, Mermaid, iconos y badges) mantienen sus propias
licencias y condiciones de uso. El [código de conducta](CODE_OF_CONDUCT.md) es una adaptación de
Contributor Covenant, bajo licencia CC BY 4.0.

---

## Autor

<table>
<tr>
<td align="center" width="140">
  <a href="https://github.com/VITIDEV06"><img src="https://github.com/VITIDEV06.png" width="100" alt="VITIDEV"></a>
</td>
<td valign="middle">
  <b>Victor Montes — VITIDEV</b><br>
  Autor y mantenedor<br>
  GitHub: <a href="https://github.com/VITIDEV06">github.com/VITIDEV06</a><br><br>
  <a href="https://github.com/VITIDEV06"><img src="https://img.shields.io/badge/GitHub-VITIDEV06-8B5CF6?style=for-the-badge&logo=github&logoColor=white&labelColor=0D0D12" alt="GitHub VITIDEV06"></a>
</td>
</tr>
</table>

---

## Créditos y atribuciones

| Recurso | Uso | Enlace |
|---|---|---|
| Claude Code (Anthropic) | Herramienta de agentes compatible | [code.claude.com](https://code.claude.com/docs/en/overview) |
| OpenCode | Herramienta de agentes compatible | [opencode.ai](https://opencode.ai) |
| Convención AGENTS.md | Formato del archivo de instrucciones compartido | [agents.md](https://agents.md) |
| Node.js | Entorno de ejecución de scripts y pruebas | [nodejs.org](https://nodejs.org) |
| Mermaid | Diagramas | [mermaid.js.org](https://mermaid.js.org) |
| Shields.io | Badges | [shields.io](https://shields.io) |
| Simple Icons | Iconos de marcas tecnológicas | [simpleicons.org](https://simpleicons.org) |
| Skill Icons | Iconos de tecnologías | [skillicons.dev](https://skillicons.dev) |
| Contributor Covenant | Base del código de conducta (CC BY 4.0) | [contributor-covenant.org](https://www.contributor-covenant.org) |
| Keep a Changelog | Formato del historial de cambios | [keepachangelog.com](https://keepachangelog.com/es-ES/1.1.0/) |

Claude, Claude Code y Anthropic son marcas de Anthropic. OpenCode, Node.js y el resto de nombres e
iconos pertenecen a sus respectivos propietarios; se usan solo para identificar las tecnologías
compatibles. VITIDEV IA OS es un proyecto independiente, sin afiliación con ellos.

<p align="center">
  <sub>VITIDEV IA OS &middot; Contexto &middot; Memoria &middot; Habilidades &middot; Agentes &middot; Automatización</sub>
</p>
