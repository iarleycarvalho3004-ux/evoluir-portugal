import { describe, expect, it } from 'vitest';
import { jsonCanonico, profundidadeJson } from './canonico';
import { sha256Hex, sha256JsHex } from './hash';

const bytes = (texto: string) => new TextEncoder().encode(texto);

describe('sha256', () => {
  it('bate com os valores de referência', () => {
    expect(sha256JsHex(bytes(''))).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256JsHex(bytes('abc'))).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('a versão nativa e a de reserva dão o mesmo resultado', async () => {
    for (const texto of ['', 'abc', 'a'.repeat(64), 'Configurações — açaí ✓']) {
      expect(await sha256Hex(texto)).toBe(sha256JsHex(bytes(texto)));
    }
  });
});

describe('jsonCanonico', () => {
  it('ordena as chaves e ignora valores indefinidos', () => {
    expect(jsonCanonico({ b: 1, a: [{ d: undefined, c: 2 }], z: null })).toBe('{"a":[{"c":2}],"b":1,"z":null}');
  });

  it('gera o mesmo texto independentemente da ordem das chaves', () => {
    expect(jsonCanonico({ x: 1, y: 2 })).toBe(jsonCanonico({ y: 2, x: 1 }));
  });
});

describe('profundidadeJson', () => {
  it('ignora colchetes dentro de textos', () => {
    expect(profundidadeJson('{"a":[{"b":"[[[["}]}', 10)).toBe(3);
  });

  it('para ao passar do limite', () => {
    expect(profundidadeJson('['.repeat(50), 10)).toBeGreaterThan(10);
  });
});
