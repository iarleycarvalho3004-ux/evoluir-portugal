import { z } from 'zod';
import { GOALS } from './types';

function dataValida(texto: string): boolean {
  const [ano, mes, dia] = texto.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  return (
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia &&
    data <= hoje &&
    ano >= hoje.getFullYear() - 120
  );
}

const numero = { invalid_type_error: 'Digite um número válido.' };

export const profileInputSchema = z
  .object({
    heightCm: z.number(numero).min(100, 'Informe uma altura entre 100 e 250 cm.').max(250, 'Informe uma altura entre 100 e 250 cm.').optional(),
    currentWeightKg: z.number(numero).min(30, 'Informe um peso entre 30 e 300 kg.').max(300, 'Informe um peso entre 30 e 300 kg.').optional(),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida, que não seja futura.')
      .refine(dataValida, 'Informe uma data válida, que não seja futura.')
      .optional(),
    approxAge: z
      .number(numero)
      .int('Informe uma idade entre 10 e 100 anos.')
      .min(10, 'Informe uma idade entre 10 e 100 anos.')
      .max(100, 'Informe uma idade entre 10 e 100 anos.')
      .optional(),
    sex: z.enum(['male', 'female']).optional(),
    goal: z.enum(GOALS).optional(),
    targetWeightKg: z.number(numero).min(30, 'Informe uma meta entre 30 e 300 kg.').max(300, 'Informe uma meta entre 30 e 300 kg.').optional(),
    dietaryRestrictions: z
      .array(z.string().trim().min(1).max(60, 'Cada restrição pode ter até 60 caracteres.'))
      .max(30, 'Use no máximo 30 restrições.')
      .optional(),
  })
  .strict();

export type ProfileInput = z.infer<typeof profileInputSchema>;
