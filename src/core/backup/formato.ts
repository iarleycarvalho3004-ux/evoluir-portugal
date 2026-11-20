import { z } from 'zod';
import { profileInputSchema } from '../db/schemas';

export const APP_ID = 'evoluir-portugal';
export const FORMAT_VERSION = 1;
/** Versão do modelo de dados guardado no backup. Sobe quando o formato de uma tabela do backup muda. */
export const DATA_SCHEMA_VERSION = 1;
export const LIMITE_BYTES = 25 * 1024 * 1024;
export const LIMITE_PROFUNDIDADE = 12;

/** Tabelas incluídas no backup. Cada módulo novo acrescenta as suas aqui, no schema e nas regras de mesclagem. */
export const TABELAS_BACKUP = ['profile', 'settings'] as const;
export type NomeTabela = (typeof TABELAS_BACKUP)[number];

const dataIso = z.string().datetime();

const registroPerfil = profileInputSchema.extend({
  id: z.literal('main'),
  createdAt: dataIso,
  updatedAt: dataIso,
});

const registroConfiguracoes = z
  .object({
    id: z.literal('main'),
    lastBackupAt: dataIso.nullable(),
    backupReminderDays: z.number().int().min(1).max(365),
    createdAt: dataIso,
    updatedAt: dataIso,
  })
  .strict();

export const envelopeSchema = z
  .object({
    app: z.literal(APP_ID),
    formatVersion: z.literal(FORMAT_VERSION),
    schemaVersion: z.number().int().min(1).max(DATA_SCHEMA_VERSION),
    exportedAt: dataIso,
    appVersion: z.string().max(40),
    includesPhotos: z.literal(false),
    data: z
      .object({
        profile: z.array(registroPerfil).max(1),
        settings: z.array(registroConfiguracoes).max(1),
      })
      .strict(),
    checksum: z.string().regex(/^[0-9a-f]{64}$/),
  })
  .strict();

export type BackupArquivo = z.infer<typeof envelopeSchema>;
export type DadosBackup = BackupArquivo['data'];

/** Relação entre tabelas: `campo` de `tabela` guarda o id de um registro de `referencia`. */
export type Relacao = { tabela: string; campo: string; referencia: string };

/** Vazia hoje. Os módulos com relacionamentos (ex.: séries → sessões de treino) declaram aqui as suas. */
export const RELACOES: Relacao[] = [];

export function contarRegistros(dados: DadosBackup): Record<NomeTabela, number> {
  return { profile: dados.profile.length, settings: dados.settings.length };
}
