import { profileInputSchema } from '../../core/db/schemas';
import type { ProfileInput } from '../../core/db/schemas';
import type { Goal, Profile, Sex } from '../../core/db/types';

export type PerfilFormulario = {
  altura: string;
  nascimento: string;
  idadeAprox: string;
  sexo: '' | Sex;
  objetivo: '' | Goal;
  metaPeso: string;
  restricoes: string;
};

export type ErrosFormulario = Partial<Record<keyof PerfilFormulario, string>>;

export type ResultadoFormulario = { ok: true; dados: ProfileInput } | { ok: false; erros: ErrosFormulario };

export const formularioVazio: PerfilFormulario = {
  altura: '',
  nascimento: '',
  idadeAprox: '',
  sexo: '',
  objetivo: '',
  metaPeso: '',
  restricoes: '',
};

const CAMPO_DO_SCHEMA: Record<string, keyof PerfilFormulario> = {
  heightCm: 'altura',
  birthDate: 'nascimento',
  approxAge: 'idadeAprox',
  sex: 'sexo',
  goal: 'objetivo',
  targetWeightKg: 'metaPeso',
  dietaryRestrictions: 'restricoes',
};

function paraTexto(valor: number | undefined): string {
  return valor === undefined ? '' : String(valor).replace('.', ',');
}

export function formularioDoPerfil(perfil: Profile | null): PerfilFormulario {
  if (!perfil) return { ...formularioVazio };
  return {
    altura: paraTexto(perfil.heightCm),
    nascimento: perfil.birthDate ?? '',
    idadeAprox: paraTexto(perfil.approxAge),
    sexo: perfil.sex ?? '',
    objetivo: perfil.goal ?? '',
    metaPeso: paraTexto(perfil.targetWeightKg),
    restricoes: (perfil.dietaryRestrictions ?? []).join(', '),
  };
}

/** Texto vazio vira "não informado"; texto não numérico vira NaN e é recusado na validação. */
function lerNumero(texto: string): number | undefined {
  const limpo = texto.trim().replace(',', '.');
  return limpo === '' ? undefined : Number(limpo);
}

function lerRestricoes(texto: string): string[] {
  const itens = texto
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter((item) => item !== '');
  return Array.from(new Set(itens));
}

export function lerFormulario(formulario: PerfilFormulario): ResultadoFormulario {
  if (formulario.nascimento.trim() !== '' && formulario.idadeAprox.trim() !== '') {
    return { ok: false, erros: { idadeAprox: 'Informe a data de nascimento ou a idade aproximada, não as duas.' } };
  }

  const bruto: Record<string, unknown> = {};
  const altura = lerNumero(formulario.altura);
  const idade = lerNumero(formulario.idadeAprox);
  const meta = lerNumero(formulario.metaPeso);
  const restricoes = lerRestricoes(formulario.restricoes);
  if (altura !== undefined) bruto.heightCm = altura;
  if (formulario.nascimento.trim() !== '') bruto.birthDate = formulario.nascimento.trim();
  if (idade !== undefined) bruto.approxAge = idade;
  if (formulario.sexo !== '') bruto.sex = formulario.sexo;
  if (formulario.objetivo !== '') bruto.goal = formulario.objetivo;
  if (meta !== undefined) bruto.targetWeightKg = meta;
  if (restricoes.length > 0) bruto.dietaryRestrictions = restricoes;

  const resultado = profileInputSchema.safeParse(bruto);
  if (resultado.success) return { ok: true, dados: resultado.data };

  const erros: ErrosFormulario = {};
  for (const problema of resultado.error.issues) {
    const campo = CAMPO_DO_SCHEMA[String(problema.path[0])];
    if (campo && !erros[campo]) erros[campo] = problema.message;
  }
  return { ok: false, erros };
}
