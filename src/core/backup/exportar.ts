import { obterBanco } from '../db/db';
import type { EvoluirDB } from '../db/db';
import { lerConfiguracoes } from '../db/repositorios';
import { jsonCanonico } from './canonico';
import { APP_ID, DATA_SCHEMA_VERSION, FORMAT_VERSION } from './formato';
import type { BackupArquivo, DadosBackup } from './formato';
import { sha256Hex } from './hash';
import { validarBackup } from './validacao';

export async function lerDadosAtuais(banco: EvoluirDB = obterBanco()): Promise<DadosBackup> {
  return banco.transaction('r', banco.profile, banco.settings, async () => ({
    profile: await banco.profile.toArray(),
    settings: await banco.settings.toArray(),
  }));
}

export type BackupGerado = { texto: string; backup: BackupArquivo; nomeArquivo: string; bytes: number };

const dois = (n: number) => String(n).padStart(2, '0');

export function nomeDoArquivo(data: Date, prefixo = 'evoluir-portugal-backup'): string {
  const dia = `${data.getFullYear()}-${dois(data.getMonth() + 1)}-${dois(data.getDate())}`;
  return `${prefixo}-${dia}-${dois(data.getHours())}${dois(data.getMinutes())}.json`;
}

/**
 * Gera o arquivo de backup a partir dos dados atuais.
 * `marcarComoBackup`: o arquivo registra a data do backup nas configurações (não usado nas cópias automáticas).
 * O arquivo gerado passa pela mesma validação da importação antes de ser entregue.
 */
export async function criarBackup(
  banco: EvoluirDB = obterBanco(),
  agora: Date = new Date(),
  opcoes: { marcarComoBackup?: boolean } = {},
): Promise<BackupGerado> {
  const marcar = opcoes.marcarComoBackup ?? true;
  await lerConfiguracoes(banco);
  const atuais = await lerDadosAtuais(banco);
  const exportadoEm = agora.toISOString();
  const data: DadosBackup = {
    profile: atuais.profile,
    settings: marcar ? atuais.settings.map((s) => ({ ...s, lastBackupAt: exportadoEm })) : atuais.settings,
  };
  const backup: BackupArquivo = {
    app: APP_ID,
    formatVersion: FORMAT_VERSION,
    schemaVersion: DATA_SCHEMA_VERSION,
    exportedAt: exportadoEm,
    appVersion: __APP_VERSION__,
    includesPhotos: false,
    data,
    checksum: await sha256Hex(jsonCanonico(data)),
  };
  const texto = JSON.stringify(backup, null, 2);
  const verificacao = await validarBackup(texto);
  if (!verificacao.ok) {
    throw new Error(`O backup gerado não passou na verificação (${verificacao.erro.codigo}).`);
  }
  return { texto, backup, nomeArquivo: nomeDoArquivo(agora), bytes: new TextEncoder().encode(texto).length };
}
