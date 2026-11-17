---
name: Propuesta de funcionalidad
about: Sugiere una skill, un agente, un comando o una mejora
title: "[Propuesta] "
labels: enhancement
---

<!--
Este issue es público: no incluyas datos personales ni secretos.
Antes de proponer, revisa el Roadmap del README y docs/decisiones.md por si ya se descartó.
-->

## Problema que se desea resolver

<!-- Qué necesidad tienes hoy y por qué lo actual no la cubre. -->

## Funcionalidad propuesta

<!-- Qué harías: skill, agente, comando, regla, documentación… Describe cómo lo usaría una persona. -->

## Beneficio esperado

<!-- A quién ayuda y cómo: estudiantes, talleres, organización personal… -->

## Posible impacto en la arquitectura

- [ ] Solo documentación.
- [ ] Skill nueva en `.claude/skills/` (compartida por ambas herramientas).
- [ ] Agente nuevo en `.claude/agents/` (requiere `npm run sincronizar`).
- [ ] Comando nuevo (skill de comando y envoltorio en `.opencode/commands/`).
- [ ] Cambios en la memoria (`memoria/`) o en su estructura.
- [ ] Cambios en la protección (`.claude/hooks/lib/reglas.mjs`, permisos).
- [ ] Afecta solo a Claude Code o solo a OpenCode.
- [ ] Añade dependencias o servicios externos.

<!-- Explica las casillas marcadas. -->

## Alternativas consideradas

<!-- Otras formas de resolverlo, si las hay. -->

## ¿Quieres implementarla?

- [ ] Sí, enviaré un Pull Request siguiendo CONTRIBUTING.md.
