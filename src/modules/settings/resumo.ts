import type { PerfilFormulario } from './perfilForm';

export type ResumoPerfil = {
  alturaCm: number | null;
  pesoKg: number | null;
  metaKg: number | null;
  imc: number | null;
  /** Meta menos peso atual: positivo = falta ganhar, negativo = falta perder. */
  diferencaKg: number | null;
  preenchidos: number;
  total: number;
};

function numeroValido(texto: string, minimo: number, maximo: number): number | null {
  const limpo = texto.trim().replace(',', '.');
  if (limpo === '') return null;
  const numero = Number(limpo);
  return Number.isFinite(numero) && numero >= minimo && numero <= maximo ? numero : null;
}

const arredondar = (valor: number) => Math.round(valor * 10) / 10;

/** Resume o que o formulário já tem de válido. Só calcula o que pode ser calculado de verdade. */
export function resumirFormulario(formulario: PerfilFormulario): ResumoPerfil {
  const alturaCm = numeroValido(formulario.altura, 100, 250);
  const pesoKg = numeroValido(formulario.peso, 30, 300);
  const metaKg = numeroValido(formulario.metaPeso, 30, 300);
  const idadeInformada = formulario.nascimento.trim() !== '' || formulario.idadeAprox.trim() !== '';
  const itens = [
    alturaCm !== null,
    pesoKg !== null,
    metaKg !== null,
    idadeInformada,
    formulario.sexo !== '',
    formulario.objetivo !== '',
  ];
  return {
    alturaCm,
    pesoKg,
    metaKg,
    imc: alturaCm !== null && pesoKg !== null ? arredondar(pesoKg / (alturaCm / 100) ** 2) : null,
    diferencaKg: pesoKg !== null && metaKg !== null ? arredondar(metaKg - pesoKg) : null,
    preenchidos: itens.filter(Boolean).length,
    total: itens.length,
  };
}
