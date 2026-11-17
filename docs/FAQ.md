# Preguntas frecuentes

Respuestas breves basadas en el funcionamiento real del repositorio. Si una duda no está aquí,
consulta [Primeros pasos](PRIMEROS-PASOS.md) o abre un issue.

## Conceptos

### ¿Qué es VITIDEV OS AI?

Un conjunto de archivos (instrucciones, reglas, skills, agentes, memoria y scripts de Node.js) que
convierte Claude Code u OpenCode en un asistente personal: sabe quién eres, recuerda tus proyectos
entre sesiones y sigue procedimientos para estudiar, investigar y organizarte. No es un sistema
operativo ni una aplicación con interfaz propia: se usa desde la herramienta de agentes que elijas.

### ¿Es un modelo de inteligencia artificial?

No. No contiene ni entrena ningún modelo. El razonamiento lo hace el modelo de lenguaje que uses a
través de Claude Code u OpenCode. VITIDEV OS AI aporta el **contexto** (quién eres, qué reglas
seguir) y los **procedimientos** (skills y agentes).

### ¿Qué diferencia hay entre Claude Code y OpenCode?

Son dos herramientas de agentes para la terminal. Claude Code es de Anthropic y usa modelos Claude.
OpenCode es de código abierto y admite muchos proveedores. VITIDEV OS AI tiene una implementación
independiente para cada una (instrucciones, reglas, skills, agentes y protección propios) y ambas
comparten solo la memoria y el workspace. Tabla completa en la sección
[Arquitectura del README](../README.md#arquitectura).

### ¿Qué modelo de IA puedo utilizar?

El proyecto no fija ninguno. En Claude Code, los modelos Claude disponibles en tu cuenta (`/model`).
En OpenCode, cualquier proveedor que configures o un modelo gratuito `opencode/…` (`/models`).
Ten en cuenta que los modelos pequeños o gratuitos siguen los procedimientos con menos fiabilidad
([limitaciones.md](limitaciones.md), L5).

## Coste y requisitos

### ¿Necesito pagar por utilizarlo?

VITIDEV OS AI es gratuito y de código abierto (licencia MIT). El coste depende del modelo:

- **Claude Code** requiere una suscripción de Claude o una clave de la API de Anthropic.
- **OpenCode** funciona con modelos gratuitos (probado con uno de ellos) o con tu propio proveedor.

### ¿Funciona sin conexión a internet?

No en el uso habitual: el modelo se ejecuta en los servidores del proveedor. Además, OpenCode
descarga su SDK de plugins la primera vez que abre la carpeta. Los archivos de memoria, el validador
y las pruebas (`npm test`) sí funcionan sin conexión. OpenCode permite configurar proveedores de
modelos locales, pero esa combinación **no se ha probado** con VITIDEV OS AI.

### ¿Puedo utilizarlo en Windows, Linux y macOS?

Está diseñado para los tres: los hooks y el plugin están escritos en Node.js para no depender de
Bash ni de PowerShell, y la protección reconoce comandos de ambas familias. **Solo se ha verificado
en Windows 11** (con Node 24). Si lo pruebas en Linux o macOS, comparte el resultado en un issue.

## Memoria y privacidad

### ¿Dónde se almacena la memoria?

En tu disco, en archivos Markdown dentro de `memoria/`: perfil, preferencias, objetivos, proyectos,
aprendizajes, sesiones e inbox. El mapa completo está en [memoria/INDICE.md](../memoria/INDICE.md).

### ¿La memoria se envía al modelo?

Sí. Para que el agente te conozca, al iniciar cada sesión se envían al proveedor del modelo el
perfil, las preferencias, los objetivos y los proyectos activos, y durante la sesión cualquier
archivo que el agente lea. Por eso no debes guardar secretos en `memoria/`. Detalle en
[Privacidad y memoria](PRIVACIDAD-Y-MEMORIA.md).

### ¿Puedo modificar los archivos manualmente?

Sí, es una de las ventajas de usar Markdown. Mantén el bloque inicial entre `---` de los archivos de
memoria (el campo `tipo` es obligatorio) y ejecuta `npm run validar` después. Abre una sesión nueva
para que el agente cargue los cambios.

### ¿Cómo puedo eliminar información de la memoria?

Pídeselo al agente: "olvida mi horario de estudio". Te mostrará exactamente qué líneas eliminará y
esperará tu confirmación; nunca borra archivos de memoria completos. También puedes borrar las
líneas a mano en el archivo. Para eliminar todo, consulta
[Privacidad y memoria](PRIVACIDAD-Y-MEMORIA.md#cómo-limpiar-información).

### ¿Qué pasa si elimino una carpeta?

- **Una carpeta de `memoria/` o sus plantillas:** el validador dará error y el agente perderá ese
  contexto. Si usas git, recupérala con `git checkout -- memoria/`.
- **Una carpeta de `workspace/`:** pierdes esos archivos. El agente nunca borra: mueve lo que sobra
  a `workspace/_archivo/` (y el hook bloquea borrados recursivos).
- **`.claude/` u `.opencode/`:** dejan de funcionar las skills, los agentes o la protección de esa
  herramienta. Vuelve a descargar el proyecto o recupéralas con git.

## Uso

### ¿Cómo agrego nuevos proyectos?

Con `/crear-proyecto Nombre del proyecto` o pidiéndolo con tus palabras. Se crea la ficha en
`workspace/proyectos/<slug>/PROYECTO.md` y la entrada en `memoria/proyectos/activos.md`.
Para pausarlo o terminarlo, díselo al agente: moverá la entrada a `pausados.md` o `finalizados.md`.

### ¿Cómo creo mis propias skills?

Cada herramienta tiene sus propias skills. Para Claude Code, crea `.claude/skills/<nombre>/SKILL.md`;
para OpenCode, `.opencode/skills/<nombre>/SKILL.md` y añade `"<nombre>": "allow"` en
`permission.skill` de `opencode.json`. Ambas llevan frontmatter (`name` y `description`) y las
secciones del procedimiento. Ejemplo en [Primeros pasos](PRIMEROS-PASOS.md#10-crea-tu-primera-skill).
Si la quieres en las dos herramientas, crea los dos archivos.

### ¿Cómo actualizo el sistema?

Si lo clonaste con git, guarda primero una copia de tu `memoria/` y después:

```bash
git pull
npm test
```

Si git informa de conflictos en archivos de `memoria/`, conserva tu versión: contiene tus datos.
Si marcaste las plantillas con `--skip-worktree` ([SECURITY.md](../SECURITY.md)), desmárcalas antes
de actualizar.

Si lo descargaste como ZIP, descarga la versión nueva y copia en ella tus carpetas `memoria/` y
`workspace/`. Revisa siempre el [CHANGELOG](../CHANGELOG.md) por si cambia la estructura.

### ¿Cómo puedo contribuir?

Lee [CONTRIBUTING.md](../CONTRIBUTING.md): explica cómo hacer un fork, crear una rama, ejecutar las
pruebas y enviar un Pull Request sin incluir datos personales.

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `node` o `npm` no se reconoce | Node.js no está instalado o la terminal no se reinició | Instala Node.js 20+ y abre una terminal nueva |
| PowerShell: "la ejecución de scripts está deshabilitada" | Política de ejecución de Windows | Usa `npm.cmd test` o el *Símbolo del sistema* |
| `npm test` falla tras editar un archivo | Frontmatter inválido, enlace roto o ruta inexistente | `npm run validar` indica el archivo y el motivo |
| No aparece un comando, skill o agente nuevo | Las herramientas cargan la configuración al iniciar | Abre una sesión nueva (L1) |
| Claude Code no muestra el resumen de estado | No aceptaste confiar en la carpeta, o Node.js no está en el PATH | Reabre `claude` en la carpeta y acepta; comprueba `node --version` |
| El primer `opencode` se queda sin respuesta | Está instalando el SDK de plugins | Espera, o ciérralo y repítelo (L10) |
| OpenCode lista skills que no son del proyecto | Descubre también `.claude/skills` y `~/.claude/skills` (quedan denegadas por `permission.skill`) | Variable de entorno `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS=1` (L9) |
| OpenCode no responde o pide proveedor | No hay modelo elegido | `/models` o `opencode auth login` |
| Mensaje "Bloqueado por seguridad: …" | La protección detectó un secreto o un comando destructivo | Es intencionado. Haz la acción tú mismo si es legítima |
| En OpenCode no se puede reescribir un archivo de memoria | El plugin bloquea `write` sobre memoria existente | Es intencionado: el agente debe usar ediciones puntuales (L7) |

Las referencias L1 a L13 corresponden a [limitaciones.md](limitaciones.md).
