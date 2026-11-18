import { describe, expect, it } from 'vitest';
import { buscarVersaoPublicada, existeVersaoNova } from './versao';

function respostaFalsa(ok: boolean, corpo: unknown): typeof fetch {
  return (async () => ({ ok, json: async () => corpo })) as unknown as typeof fetch;
}

describe('existeVersaoNova', () => {
  it('é falso sem versão publicada', () => {
    expect(existeVersaoNova('2026-01-01T00:00:00.000Z', null)).toBe(false);
  });

  it('é falso quando o build é o mesmo', () => {
    const publicada = { version: '0.3.0', buildTime: '2026-01-01T00:00:00.000Z' };
    expect(existeVersaoNova('2026-01-01T00:00:00.000Z', publicada)).toBe(false);
  });

  it('é verdadeiro quando o build publicado é diferente', () => {
    const publicada = { version: '0.4.0', buildTime: '2026-02-01T00:00:00.000Z' };
    expect(existeVersaoNova('2026-01-01T00:00:00.000Z', publicada)).toBe(true);
  });
});

describe('buscarVersaoPublicada', () => {
  it('lê um version.json válido', async () => {
    const dados = { version: '0.3.0', buildTime: '2026-01-01T00:00:00.000Z' };
    expect(await buscarVersaoPublicada(respostaFalsa(true, dados))).toEqual(dados);
  });

  it('devolve null para resposta com erro HTTP', async () => {
    expect(await buscarVersaoPublicada(respostaFalsa(false, {}))).toBeNull();
  });

  it('devolve null para formato inesperado', async () => {
    expect(await buscarVersaoPublicada(respostaFalsa(true, { version: 3 }))).toBeNull();
    expect(await buscarVersaoPublicada(respostaFalsa(true, null))).toBeNull();
  });

  it('devolve null quando a conexão falha', async () => {
    const falha = (async () => {
      throw new Error('sem rede');
    }) as unknown as typeof fetch;
    expect(await buscarVersaoPublicada(falha)).toBeNull();
  });
});
