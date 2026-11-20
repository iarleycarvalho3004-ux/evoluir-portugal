import { obterBanco } from '../db/db';
import type { EvoluirDB } from '../db/db';
import type { Snapshot, SnapshotReason } from '../db/types';
import { criarBackup } from './exportar';
import { contarRegistros } from './formato';
import type { BackupArquivo } from './formato';
import { validarBackup } from './validacao';

export const MAX_SNAPSHOTS = 3;

function novoId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  return `snap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export type VerificacaoSnapshot = { ok: true; snapshot: Snapshot; backup: BackupArquivo } | { ok: false; motivo: string };

/** Relê o snapshot gravado e confere se ele continua íntegro e completo. */
export async function verificarSnapshot(id: string, banco: EvoluirDB = obterBanco()): Promise<VerificacaoSnapshot> {
  const lido = await banco.snapshots.get(id);
  if (!lido) return { ok: false, motivo: 'A cópia de segurança não foi encontrada depois de gravada.' };
  const resultado = await validarBackup(lido.payload);
  if (!resultado.ok) return { ok: false, motivo: resultado.erro.mensagem };
  const contagem = contarRegistros(resultado.backup.data);
  for (const [tabela, quantidade] of Object.entries(lido.recordCounts)) {
    if (contagem[tabela as keyof typeof contagem] !== quantidade) {
      return { ok: false, motivo: 'A cópia de segurança está incompleta.' };
    }
  }
  return { ok: true, snapshot: lido, backup: resultado.backup };
}

export async function podarSnapshots(banco: EvoluirDB, manter: number = MAX_SNAPSHOTS): Promise<void> {
  const todos = await banco.snapshots.orderBy('createdAt').reverse().toArray();
  const excedentes = todos.slice(manter).map((s) => s.id);
  if (excedentes.length > 0) await banco.snapshots.bulkDelete(excedentes);
}

/**
 * Cria uma cópia de segurança dos dados atuais, relê e verifica. Só devolve sucesso se a cópia estiver íntegra.
 * Se a verificação falhar, a cópia incompleta é removida e o erro é lançado.
 */
export async function criarSnapshot(
  motivo: SnapshotReason,
  banco: EvoluirDB = obterBanco(),
  agora: Date = new Date(),
): Promise<Snapshot> {
  const { texto, backup } = await criarBackup(banco, agora, { marcarComoBackup: false });
  const snapshot: Snapshot = {
    id: novoId(),
    createdAt: agora.toISOString(),
    reason: motivo,
    payload: texto,
    recordCounts: contarRegistros(backup.data),
  };
  await banco.snapshots.add(snapshot);
  const verificacao = await verificarSnapshot(snapshot.id, banco);
  if (!verificacao.ok) {
    await banco.snapshots.delete(snapshot.id);
    throw new Error(verificacao.motivo);
  }
  await podarSnapshots(banco);
  return snapshot;
}

export async function listarSnapshots(banco: EvoluirDB = obterBanco()): Promise<Snapshot[]> {
  return banco.snapshots.orderBy('createdAt').reverse().toArray();
}

export async function excluirSnapshot(id: string, banco: EvoluirDB = obterBanco()): Promise<void> {
  await banco.snapshots.delete(id);
}
