---
paths:
  - "memoria/**"
---

# Reglas de la memoria persistente

Se cargan cuando trabajas con archivos de `memoria/`. El procedimiento completo está en
la skill `gestionar-memoria`.

## Dónde va cada cosa

| Tipo de información | Archivo |
|---|---|
| Datos personales (nombre, rol, estudios, contexto) | `memoria/personal/perfil.md` |
| Preferencias (tono, formato, horarios, herramientas) | `memoria/personal/preferencias.md` |
| Objetivos (corto, medio, largo plazo) | `memoria/objetivos.md` |
| Proyectos activos / pausados / finalizados | `memoria/proyectos/{activos,pausados,finalizados}.md` |
| Aprendizajes (lo que el usuario estudió y entendió) | `memoria/aprendizajes/AAAA-MM-DD-tema.md` + índice |
| Resúmenes de sesión | `memoria/sesiones/AAAA-MM-DD.md` |
| Lo que aún no sabes clasificar | `memoria/inbox.md` |

## Reglas

1. **Añadir** información nueva: permitido. Actualiza `actualizado:` en el frontmatter.
2. **Modificar o eliminar** información existente: muestra el antes y el después y
   espera aprobación explícita. Nunca borres secciones enteras.
3. **Un proyecto vive en un solo registro.** Al cambiar su estado, mueve la entrada
   completa de un archivo a otro (por ejemplo `activos.md` → `pausados.md`).
4. **Formato de entrada de proyecto:** encabezado `## slug-del-proyecto` y la lista de
   campos de la plantilla (`.claude/skills/crear-proyecto/plantilla-registro.md`).
5. Escribe de forma breve, en tercera persona y con hechos verificables
   ("Estudia Ingeniería en Sistemas, 5.º semestre"), no interpretaciones.
6. Nunca guardes secretos (ver `seguridad.md`).
7. Fechas: `AAAA-MM-DD`.
