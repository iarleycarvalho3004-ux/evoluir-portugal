import { describe, expect, it } from 'vitest';
import { formularioDoPerfil, formularioVazio, lerFormulario } from './perfilForm';
import type { PerfilFormulario } from './perfilForm';

function com(parcial: Partial<PerfilFormulario>): PerfilFormulario {
  return { ...formularioVazio, restricoes: [], ...parcial };
}

describe('lerFormulario', () => {
  it('aceita o formulário totalmente vazio (nada é obrigatório)', () => {
    expect(lerFormulario(formularioVazio)).toEqual({ ok: true, dados: {} });
  });

  it('aceita vírgula como separador decimal', () => {
    const resultado = lerFormulario(com({ altura: '178,5', peso: '80,5', metaPeso: '75' }));
    expect(resultado).toEqual({ ok: true, dados: { heightCm: 178.5, currentWeightKg: 80.5, targetWeightKg: 75 } });
  });

  it('recusa altura fora da faixa', () => {
    const resultado = lerFormulario(com({ altura: '5' }));
    expect(resultado).toEqual({ ok: false, erros: { altura: 'Informe uma altura entre 100 e 250 cm.' } });
  });

  it('recusa peso fora da faixa', () => {
    const resultado = lerFormulario(com({ peso: '10' }));
    expect(resultado).toEqual({ ok: false, erros: { peso: 'Informe um peso entre 30 e 300 kg.' } });
  });

  it('recusa texto não numérico', () => {
    const resultado = lerFormulario(com({ altura: 'alto' }));
    expect(resultado).toEqual({ ok: false, erros: { altura: 'Digite um número válido.' } });
  });

  it('recusa data de nascimento futura', () => {
    expect(lerFormulario(com({ nascimento: '2999-01-01' })).ok).toBe(false);
  });

  it('recusa informar data de nascimento e idade ao mesmo tempo', () => {
    expect(lerFormulario(com({ nascimento: '1990-05-10', idadeAprox: '30' })).ok).toBe(false);
  });

  it('limpa as restrições alimentares sem diferenciar maiúsculas', () => {
    const resultado = lerFormulario(com({ restricoes: ['lactose', ' Lactose ', 'glúten', ''] }));
    expect(resultado).toEqual({ ok: true, dados: { dietaryRestrictions: ['lactose', 'glúten'] } });
  });

  it('inclui sexo e objetivo só quando escolhidos', () => {
    const resultado = lerFormulario(com({ sexo: 'male', objetivo: 'weight-gain' }));
    expect(resultado).toEqual({ ok: true, dados: { sex: 'male', goal: 'weight-gain' } });
  });
});

describe('formularioDoPerfil', () => {
  it('devolve o formulário vazio sem perfil', () => {
    expect(formularioDoPerfil(null)).toEqual(formularioVazio);
  });

  it('converte um perfil salvo em texto', () => {
    const formulario = formularioDoPerfil({
      id: 'main',
      heightCm: 178.5,
      currentWeightKg: 80,
      dietaryRestrictions: ['lactose', 'glúten'],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(formulario.altura).toBe('178,5');
    expect(formulario.peso).toBe('80');
    expect(formulario.restricoes).toEqual(['lactose', 'glúten']);
    expect(formulario.nascimento).toBe('');
  });
});
