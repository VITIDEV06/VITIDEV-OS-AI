// Pruebas de estructura: el proyecto completo pasa el validador
// y el validador detecta errores reales en un proyecto roto.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validar } from '../scripts/validar.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('el proyecto pasa la validación estructural sin errores', () => {
  const { errores } = validar(RAIZ);
  assert.deepEqual(errores, []);
});

test('el validador detecta skills, agentes y referencias rotas', () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'vitidev-val-'));
  try {
    cpSync(RAIZ, tmp, { recursive: true, filter: (s) => !s.includes('node_modules') });
    // Skill con name distinto a la carpeta y YAML problemático
    writeFileSync(path.join(tmp, '.claude/skills/organizar/SKILL.md'),
      '---\nname: otra\ndescription: Ordena: todo\n---\n# x\n');
    // Agente con herramienta inventada
    writeFileSync(path.join(tmp, '.claude/agents/tutor.md'),
      '---\nname: tutor\ndescription: d\ntools: Read, Teletransportar\n---\ncorto\n');
    // Referencia a una ruta que no existe
    writeFileSync(path.join(tmp, 'memoria/inbox.md'),
      '---\ntipo: inbox\n---\nVer `memoria/no-existe.md` y la skill `inventada`.\n');
    const { errores } = validar(tmp);
    const txt = errores.join('\n');
    assert.match(txt, /Skill \.claude\/skills\/organizar: name "otra"/);
    assert.match(txt, /contiene ": " sin comillas/);
    assert.match(txt, /herramienta desconocida "Teletransportar"/);
    assert.match(txt, /instrucciones demasiado cortas/);
    assert.match(txt, /ruta inexistente → memoria\/no-existe\.md/);
    assert.match(txt, /skill inexistente inventada/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
