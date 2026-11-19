export type Sex = 'male' | 'female';

export const GOALS = [
  'hypertrophy',
  'weight-gain',
  'fat-loss',
  'definition',
  'recomposition',
  'maintenance',
  'strength',
  'health',
] as const;
export type Goal = (typeof GOALS)[number];

/** Perfil único do aparelho. Todos os campos de dados pessoais são opcionais. */
export interface Profile {
  id: 'main';
  heightCm?: number;
  /** Ponto de partida. O histórico de peso (V3.0) começa a partir deste valor. */
  currentWeightKg?: number;
  birthDate?: string;
  approxAge?: number;
  sex?: Sex;
  goal?: Goal;
  targetWeightKg?: number;
  dietaryRestrictions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: 'main';
  lastBackupAt: string | null;
  backupReminderDays: number;
  createdAt: string;
  updatedAt: string;
}
