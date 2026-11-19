import { describe, expect, it } from 'vitest';
import { formularioVazio } from './perfilForm';
import type { PerfilFormulario } from './perfilForm';
import { resumirFormulario } from './resumo';

function com(parcial: Partial<PerfilFormulario>): PerfilFormulario {
  return { ...formularioVazio, restricoes: [], ...parcial };
}

describe('resumirFormulario', () => {
  it('não calcula nada com o formulário vazio', () => {
    const resumo = resumirFormulario(com({}));
    expect(resumo).toMatchObject({ alturaCm: null, pesoKg: null, metaKg: null, imc: null, diferencaKg: null, preenchidos: 0, total: 6 });
  });

  it('calcula IMC e diferença para a meta com dados reais', () => {
    const resumo = resumirFormulario(com({ altura: '180', peso: '81', metaPeso: '75', sexo: 'male' }));
    expect(resumo.imc).toBe(25);
    expect(resumo.diferencaKg).toBe(-6);
    expect(resumo.preenchidos).toBe(4);
  });

  it('aceita vírgula decimal', () => {
    expect(resumirFormulario(com({ peso: '80,5', metaPeso: '85' })).diferencaKg).toBe(4.5);
  });

  it('ignora valores fora da faixa', () => {
    const resumo = resumirFormulario(com({ altura: '5', peso: '81' }));
    expect(resumo.alturaCm).toBeNull();
    expect(resumo.imc).toBeNull();
  });

  it('conta data de nascimento ou idade como um único item', () => {
    expect(resumirFormulario(com({ nascimento: '1990-05-10' })).preenchidos).toBe(1);
    expect(resumirFormulario(com({ idadeAprox: '30' })).preenchidos).toBe(1);
  });
});
