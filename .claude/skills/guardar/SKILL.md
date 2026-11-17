---
name: guardar
description: Comando rápido para guardar un dato en la memoria persistente. Clasifica el dato y lo guarda en el archivo correcto de memoria/ siguiendo la skill gestionar-memoria.
argument-hint: "<dato que quieres que recuerde>"
disable-model-invocation: true
---

# /guardar — Guardar información

Dato: $ARGUMENTS

## Objetivo

Guardar un dato en la memoria con una sola orden del usuario, en el archivo correcto y sin duplicados.

## Procedimiento

1. Si no hay dato, pregunta: "¿Qué quieres que recuerde?"
2. Si el dato parece un secreto (contraseña, token, número de tarjeta o de documento),
   **no lo guardes**: explica por qué y sugiere un gestor de contraseñas.
3. Sigue la operación **Guardar** de la skill `gestionar-memoria`
   (`.claude/skills/gestionar-memoria/SKILL.md`):
   clasifica → lee el destino → añade, o propone el cambio si ya existía un valor distinto.
4. Si el dato contiene varias piezas (por ejemplo, un objetivo y una preferencia),
   guarda cada una en su archivo.
5. Confirma en una línea por dato: `Guardado en memoria/<archivo> → <sección>`.

## Reglas

- Nunca guardes secretos.
- Si el dato contradice uno existente, muestra antes → después y espera aprobación.

## Resultado esperado

El dato queda en el archivo de memoria correcto, sin duplicados y con la fecha actualizada.
