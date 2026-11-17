---
name: gestionar-memoria
description: Guarda, consulta, actualiza y reorganiza la memoria persistente del usuario en memoria/ (perfil, preferencias, objetivos, proyectos activos/pausados/finalizados, aprendizajes, inbox). Úsala cuando el usuario diga "recuerda que…", "guarda…", "¿qué sabes de mí?", "actualiza mi…", "olvida…", cuando cambie el estado de un proyecto, o cuando aparezca un dato personal estable que merezca conservarse.
argument-hint: "[guardar|consultar|actualizar|olvidar] <dato o pregunta>"
---

# Skill: gestionar memoria

Eres responsable de que la memoria de VITIDEV IA OS sea **correcta, ordenada y del usuario**.
Mapa de archivos: `memoria/INDICE.md`. Reglas: `.claude/rules/memoria.md`.

Petición recibida: $ARGUMENTS

## Objetivo

Mantener la memoria persistente correcta, ordenada y bajo control del usuario: cada dato en un único sitio y ningún cambio sin aprobación.

## Cuándo activarse

- Peticiones explícitas: "recuerda", "guarda", "apunta", "olvida", "¿qué sabes de…?".
- El usuario revela un dato **estable y útil** (carrera, objetivo, preferencia de formato).
  En ese caso pregunta brevemente: "¿Lo guardo en tu perfil?".
- Un proyecto cambia de estado (se pausa, se retoma, se termina).

**No** te actives para datos efímeros ("hoy estoy cansado") ni para secretos.

## Procedimiento — operaciones

### 1. Guardar (añadir)
1. Clasifica el dato con esta tabla:

   | Si el dato es… | Va a… |
   |---|---|
   | Identidad, estudios, rol, intereses | `memoria/personal/perfil.md` |
   | Cómo le gusta trabajar o recibir respuestas | `memoria/personal/preferencias.md` |
   | Una meta con horizonte temporal | `memoria/objetivos.md` (sección de plazo) |
   | Información de un proyecto | entrada del proyecto en `memoria/proyectos/*.md` y su `PROYECTO.md` |
   | Algo aprendido sobre un tema | `memoria/aprendizajes/` (usa la skill `aprender`) |
   | No encaja claramente | `memoria/inbox.md` como `- AAAA-MM-DD — dato` |

2. Lee el archivo destino. Si el campo tiene `_sin completar_` o la sección está vacía,
   reemplaza el marcador por el dato (no requiere aprobación: no se pierde nada).
3. Si ya hay un valor distinto, pasa a **Actualizar**.
4. Actualiza `actualizado:` en el frontmatter con la fecha de hoy.
5. Confirma en una línea: qué guardaste y en qué archivo.

### 2. Consultar
1. Busca con la herramienta de búsqueda de texto (grep) en `memoria/` (y en `workspace/proyectos/*/PROYECTO.md` si es de un proyecto).
2. Responde citando el archivo de origen. Si no está, dilo: no inventes.

### 3. Actualizar (modificar un dato existente)
1. Muestra: **Antes:** `valor actual` → **Después:** `valor nuevo` y el archivo.
2. Espera aprobación explícita ("sí", "ok", "adelante"). Sin aprobación, no edites.
3. Edita solo esa línea o sección y actualiza `actualizado:`.

### 4. Olvidar (eliminar un dato)
1. Muestra exactamente qué se eliminará y pide confirmación.
2. Con aprobación, elimina solo esas líneas. Nunca borres archivos de memoria completos.

### 5. Cambiar el estado de un proyecto
1. Localiza la sección `## slug` en `activos.md`, `pausados.md` o `finalizados.md`.
2. Añade los campos que exige el destino:
   pausado → `Motivo de pausa` y `Condición para retomar`;
   finalizado → `Resultado` y `Lecciones aprendidas`.
3. Muestra el movimiento propuesto y, con aprobación, corta la sección del origen y pégala
   en el destino. Si el origen queda vacío, restaura su marcador `_Sin proyectos …_`.
4. Actualiza `Estado:` en `workspace/proyectos/<slug>/PROYECTO.md`.

## Reglas

- Añadir información nueva está permitido; modificar o eliminar información existente requiere aprobación explícita.
- Nunca guardes secretos (contraseñas, tokens, números de tarjeta o de documentos).
- Nunca borres archivos de memoria completos.

## Resultado esperado

- El dato queda en **un único** archivo correcto, con fecha actualizada.
- El usuario recibe una confirmación de una línea con la ruta.
- Ningún dato existente cambia sin aprobación.
