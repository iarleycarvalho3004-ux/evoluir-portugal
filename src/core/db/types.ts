export type Sex = 'male' | 'female';
export type Goal = 'hypertrophy' | 'fat-loss' | 'recomposition' | 'maintenance';

/** Perfil único do aparelho. Todos os campos de dados pessoais são opcionais. */
export interface Profile {
  id: 'main';
  heightCm?: number;
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
