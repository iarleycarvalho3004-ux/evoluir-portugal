import { describe, expect, it } from 'vitest';
import { formularioDoPerfil, formularioVazio, lerFormulario } from './perfilForm';
import type { PerfilFormulario } from './perfilForm';

function com(parcial: Partial<PerfilFormulario>): PerfilFormulario {
  return { ...formularioVazio, ...parcial };
}

describe('lerFormulario', () => {
  it('aceita o formulário totalmente vazio (nada é obrigatório)', () => {
    expect(lerFormulario(formularioVazio)).toEqual({ ok: true, dados: {} });
  });

  it('aceita vírgula como separador decimal', () => {
    const resultado = lerFormulario(com({ altura: '178,5', metaPeso: '80' }));
    expect(resultado).toEqual({ ok: true, dados: { heightCm: 178.5, targetWeightKg: 80 } });
  });

  it('recusa altura fora da faixa', () => {
    const resultado = lerFormulario(com({ altura: '5' }));
    expect(resultado).toEqual({ ok: false, erros: { altura: 'Informe uma altura entre 100 e 250 cm.' } });
  });

  it('recusa texto não numérico', () => {
    const resultado = lerFormulario(com({ altura: 'alto' }));
    expect(resultado).toEqual({ ok: false, erros: { altura: 'Digite um número válido.' } });
  });

  it('recusa data de nascimento futura', () => {
    const resultado = lerFormulario(com({ nascimento: '2999-01-01' }));
    expect(resultado.ok).toBe(false);
  });

  it('recusa informar data de nascimento e idade ao mesmo tempo', () => {
    const resultado = lerFormulario(com({ nascimento: '1990-05-10', idadeAprox: '30' }));
    expect(resultado.ok).toBe(false);
  });

  it('separa e limpa as restrições alimentares', () => {
    const resultado = lerFormulario(com({ restricoes: 'lactose, glúten;  lactose\n amendoim ,' }));
    expect(resultado).toEqual({ ok: true, dados: { dietaryRestrictions: ['lactose', 'glúten', 'amendoim'] } });
  });

  it('inclui sexo e objetivo só quando escolhidos', () => {
    const resultado = lerFormulario(com({ sexo: 'male', objetivo: 'hypertrophy' }));
    expect(resultado).toEqual({ ok: true, dados: { sex: 'male', goal: 'hypertrophy' } });
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
      dietaryRestrictions: ['lactose', 'glúten'],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(formulario.altura).toBe('178,5');
    expect(formulario.restricoes).toBe('lactose, glúten');
    expect(formulario.nascimento).toBe('');
  });
});
