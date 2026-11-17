# Política de seguridad

VITIDEV IA OS trabaja con información personal (perfil, objetivos, proyectos, apuntes) y con
herramientas que pueden leer archivos y ejecutar comandos. Esta política explica qué proteger,
cómo hacerlo y cómo informar de un problema.

## Versiones con soporte

| Versión | Soporte |
|---|---|
| 1.0.x | Sí |

## Cómo informar de una vulnerabilidad

**No abras un issue público** con los detalles de una vulnerabilidad.

1. Si el repositorio tiene activado el informe privado de vulnerabilidades, usa la pestaña
   **Security → Report a vulnerability** ([cómo funciona](https://docs.github.com/es/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)).
2. Si no está disponible, contacta con el propietario por un canal privado de su perfil de GitHub:
   [github.com/VITIDEV06](https://github.com/VITIDEV06).

Incluye: descripción, archivos afectados, pasos para reproducirlo, impacto y, si la tienes,
una propuesta de corrección. **No incluyas secretos reales**: usa valores ficticios.

Ejemplos de lo que se considera vulnerabilidad aquí:

- Una forma de leer `.env`, claves o carpetas `secrets/` que el hook o el plugin no bloquean.
- Un comando destructivo que escapa a `.claude/hooks/lib/reglas.mjs`.
- Una configuración que permite a un agente escribir fuera del proyecto sin preguntar.
- Un archivo versionado que expone datos personales o credenciales.

## Qué nunca debe publicarse

| Nunca publiques | Dónde suele aparecer |
|---|---|
| Claves de API, tokens, contraseñas | `.env`, configuración global de la herramienta, notas |
| Certificados y claves privadas | `*.pem`, `*.key`, `id_rsa`, `id_ed25519` |
| Datos personales reales | `memoria/personal/`, `memoria/objetivos.md`, `memoria/sesiones/` |
| Trabajo privado | `workspace/proyectos/`, `workspace/universidad/`, `workspace/entregables/` |
| Configuración local | `.claude/settings.local.json`, `CLAUDE.local.md` |
| Rutas y nombres de tu equipo | Registros, capturas, ejemplos copiados de la terminal |

## API keys, tokens y variables de entorno

- VITIDEV IA OS **no necesita ninguna clave dentro del proyecto**. `opencode.json` no declara modelo,
  proveedor ni credenciales, y `npm run validar` falla si alguien los añade.
- Las credenciales se configuran en cada herramienta, fuera del repositorio:
  - Claude Code: inicio de sesión con tu cuenta o variable de entorno de tu sistema
    ([documentación](https://code.claude.com/docs/en/setup)).
  - OpenCode: `opencode auth login`, que guarda la credencial en tu perfil de usuario
    ([documentación](https://opencode.ai/docs/providers/)).
- Si una extensión tuya necesita variables de entorno, guárdalas en un archivo `.env` local.
  `.gitignore` ya lo excluye, y el hook y el plugin impiden que el agente lo lea.
- Nunca pegues una clave en el chat con el agente ni en `memoria/`: su contenido se envía al
  proveedor del modelo como contexto.
- Usa un gestor de contraseñas para guardar tus credenciales.

## Qué hacer ante una filtración accidental

Si publicaste una clave o un dato privado:

1. **Revoca o rota la credencial de inmediato** en el panel del proveedor. Es el único paso que
   la inutiliza: borrarla del repositorio no basta, porque sigue en el historial y puede estar copiada.
2. Elimina el archivo del índice de git y añade su ruta a `.gitignore`:

   ```bash
   git rm --cached ruta/del/archivo
   ```

3. Si el dato ya está en el historial publicado, sigue la guía oficial
   [Eliminar datos confidenciales de un repositorio](https://docs.github.com/es/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).
   Reescribir el historial es una operación delicada: haz una copia antes.
4. Si se filtraron datos personales de otras personas, avísales.

## Memoria y workspace antes de publicar

Las carpetas `memoria/` y `workspace/` se distribuyen como **plantillas vacías**. Cuando las usas,
se llenan de información personal. Protección incluida en `.gitignore`:

- **Ignorado por defecto:** todo lo que crean los comandos dentro de `memoria/aprendizajes/`,
  `memoria/sesiones/` y las subcarpetas de `workspace/` (salvo sus `README.md` y el ejemplo del inbox).
- **Versionado, pero revisa cada cambio:** las plantillas `memoria/personal/*.md`,
  `memoria/objetivos.md`, `memoria/inbox.md`, `memoria/proyectos/*.md` y `memoria/aprendizajes/INDICE.md`.
  Al completarlas aparecen como modificadas en `git status`.

Si trabajas con tu memoria real en un clon que vas a publicar, marca las plantillas para que git
ignore tus cambios locales:

```bash
git update-index --skip-worktree memoria/personal/perfil.md memoria/personal/preferencias.md memoria/objetivos.md memoria/inbox.md memoria/proyectos/activos.md memoria/proyectos/pausados.md memoria/proyectos/finalizados.md memoria/aprendizajes/INDICE.md
```

Para deshacerlo, usa el mismo comando con `--no-skip-worktree`. Más opciones en
[docs/PRIVACIDAD-Y-MEMORIA.md](docs/PRIVACIDAD-Y-MEMORIA.md).

## Lista de revisión antes de publicar cambios

```bash
git status
git diff --staged
```

- [ ] Ningún archivo de `memoria/` contiene datos reales.
- [ ] Ningún archivo nuevo de `workspace/` es personal.
- [ ] No hay `.env`, `*.pem`, `*.key` ni carpetas `secrets/` o `credenciales/`.
- [ ] `opencode.json` y `.claude/settings.json` no contienen modelos, proveedores ni claves.
- [ ] Los ejemplos usan nombres y datos ficticios.
- [ ] No hay rutas absolutas de tu equipo en documentación ni capturas.
- [ ] `npm run validar` termina con `0 error(es)`.

## Alcance de la protección incluida

El proyecto aplica tres capas: instrucciones (`.claude/rules/seguridad.md`), permisos de cada
herramienta y bloqueo en tiempo real (hook `PreToolUse` en Claude Code, plugin en OpenCode V1).
La protección se basa en patrones y **no es un sandbox**: un comando ofuscado podría escapar.
En OpenCode V2 el plugin de V1 no se ejecuta. Limitaciones completas en
[docs/limitaciones.md](docs/limitaciones.md).

No uses los modos que omiten permisos (`--dangerously-skip-permissions` en Claude Code o
`--auto` en OpenCode).
