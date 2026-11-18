import { describe, expect, it } from 'vitest';
import { formatarData } from './formatarData';

describe('formatarData', () => {
  it('devolve "indisponível" para datas inválidas', () => {
    expect(formatarData('isto-nao-e-data')).toBe('indisponível');
  });

  it('formata uma data ISO válida em pt-BR', () => {
    expect(formatarData('2026-11-17T12:00:00.000Z')).toContain('2026');
  });
});
