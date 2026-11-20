import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EvoluirDB } from '../db/db';
import { lerConfiguracoes, lerPerfil, registrarBackupFeito, salvarPerfil } from '../db/repositorios';
import { criarBackup, lerDadosAtuais, nomeDoArquivo } from './exportar';
import type { DadosBackup } from './formato';
import { aplicarRestauracao, detectarConflitos, gerarPrevia, planejarRestauracao } from './restaurar';
import { MAX_SNAPSHOTS, criarSnapshot, excluirSnapshot, listarSnapshots, verificarSnapshot } from './snapshots';
import { validarBackup } from './validacao';

let banco: EvoluirDB;
let banco2: EvoluirDB;

beforeEach(() => {
  const sufixo = Math.random().toString(36).slice(2);
  banco = new EvoluirDB(`teste-a-${sufixo}`);
  banco2 = new EvoluirDB(`teste-b-${sufixo}`);
});

afterEach(async () => {
  await banco.delete();
  await banco2.delete();
});

const T1 = '2026-01-01T10:00:00.000Z';
const T2 = '2026-06-01T10:00:00.000Z';

function perfil(updatedAt: string, heightCm: number): DadosBackup['profile'][number] {
  return { id: 'main', heightCm, createdAt: T1, updatedAt };
}
function config(lastBackupAt: string | null): DadosBackup['settings'][number] {
  return { id: 'main', lastBackupAt, backupReminderDays: 7, createdAt: T1, updatedAt: T1 };
}
const dados = (p: DadosBackup['profile'], s: DadosBackup['settings']): DadosBackup => ({ profile: p, settings: s });

describe('exportar e importar', () => {
  it('gera um backup válido e que contém os dados', async () => {
    await salvarPerfil({ heightCm: 178, currentWeightKg: 80 }, banco);
    const gerado = await criarBackup(banco, new Date('2026-11-18T12:00:00.000Z'));
    const validado = await validarBackup(gerado.texto);
    expect(validado.ok).toBe(true);
    expect(gerado.backup.data.profile[0]?.heightCm).toBe(178);
    expect(gerado.backup.includesPhotos).toBe(false);
    expect(gerado.nomeArquivo).toMatch(/^evoluir-portugal-backup-2026-11-1\d-\d{4}\.json$/);
  });

  it('o arquivo registra a data do backup nas configurações', async () => {
    const gerado = await criarBackup(banco, new Date('2026-11-18T12:00:00.000Z'));
    expect(gerado.backup.data.settings[0]?.lastBackupAt).toBe('2026-11-18T12:00:00.000Z');
  });

  it('restaura em outro aparelho e os dados ficam iguais', async () => {
    await salvarPerfil({ heightCm: 178, goal: 'strength', dietaryRestrictions: ['Lactose'] }, banco);
    const gerado = await criarBackup(banco);
    const validado = await validarBackup(gerado.texto);
    if (!validado.ok) throw new Error('backup inválido');
    const plano = planejarRestauracao(await lerDadosAtuais(banco2), validado.backup.data, 'substituir', { profile: 'mais-recente' });
    await aplicarRestauracao(plano, banco2);
    expect(await lerPerfil(banco2)).toEqual(await lerPerfil(banco));
  });

  it('nomeia o arquivo com data e hora', () => {
    expect(nomeDoArquivo(new Date(2026, 10, 18, 9, 5))).toBe('evoluir-portugal-backup-2026-11-18-0905.json');
  });

  it('registrarBackupFeito guarda a data nas configurações', async () => {
    await registrarBackupFeito('2026-11-18T12:00:00.000Z', banco);
    expect((await lerConfiguracoes(banco)).lastBackupAt).toBe('2026-11-18T12:00:00.000Z');
  });
});

describe('planejarRestauracao', () => {
  const escolha = { profile: 'mais-recente' as const };

  it('substituir apaga tudo e grava o conteúdo do backup', () => {
    const plano = planejarRestauracao(dados([perfil(T2, 170)], [config(null)]), dados([perfil(T1, 180)], []), 'substituir', escolha);
    expect(plano.profile).toMatchObject({ acao: 'substituir', limpar: true });
    expect(plano.profile.gravar[0]?.heightCm).toBe(180);
    expect(plano.settings).toMatchObject({ acao: 'substituir', limpar: true, gravar: [] });
  });

  it('mesclar adiciona o perfil quando só o backup tem', () => {
    const plano = planejarRestauracao(dados([], []), dados([perfil(T1, 180)], [config(T1)]), 'mesclar', escolha);
    expect(plano.profile).toMatchObject({ acao: 'adicionar', limpar: false });
    expect(plano.settings.acao).toBe('adicionar');
  });

  it('mesclar sem conflito quando os perfis são idênticos', () => {
    const igual = dados([perfil(T1, 180)], []);
    expect(planejarRestauracao(igual, igual, 'mesclar', escolha).profile.acao).toBe('manter');
    expect(detectarConflitos(igual, igual)).toEqual([]);
  });

  it('mesclar resolve o conflito pela escolha do usuário', () => {
    const atual = dados([perfil(T2, 170)], []);
    const backup = dados([perfil(T1, 180)], []);
    expect(detectarConflitos(atual, backup)).toHaveLength(1);
    expect(planejarRestauracao(atual, backup, 'mesclar', { profile: 'mais-recente' }).profile.acao).toBe('manter');
    expect(planejarRestauracao(atual, backup, 'mesclar', { profile: 'manter-atual' }).profile.acao).toBe('manter');
    const usar = planejarRestauracao(atual, backup, 'mesclar', { profile: 'usar-backup' });
    expect(usar.profile.acao).toBe('atualizar');
    expect(usar.profile.gravar[0]?.heightCm).toBe(180);
  });

  it('"mais recente" usa o backup quando ele foi alterado depois', () => {
    const plano = planejarRestauracao(dados([perfil(T1, 170)], []), dados([perfil(T2, 180)], []), 'mesclar', escolha);
    expect(plano.profile.acao).toBe('atualizar');
  });

  it('mesclar configurações mantém as atuais e fica com o backup mais recente', () => {
    const atual = dados([], [{ ...config(T1), backupReminderDays: 14 }]);
    const plano = planejarRestauracao(atual, dados([], [config(T2)]), 'mesclar', escolha);
    expect(plano.settings.acao).toBe('atualizar');
    expect(plano.settings.gravar[0]).toMatchObject({ lastBackupAt: T2, backupReminderDays: 14 });
  });

  it('gerarPrevia mostra contagens, período e conflitos', async () => {
    await salvarPerfil({ heightCm: 170 }, banco);
    const gerado = await criarBackup(banco);
    const previa = gerarPrevia(dados([perfil(T2, 175)], []), gerado.backup);
    expect(previa.contagens.profile).toEqual({ backup: 1, atual: 1 });
    expect(previa.periodo.inicio).not.toBeNull();
    expect(previa.conflitos).toHaveLength(1);
  });
});

describe('aplicarRestauracao', () => {
  it('mesclar atualiza só o que o plano manda', async () => {
    await salvarPerfil({ heightCm: 170 }, banco);
    const atual = await lerDadosAtuais(banco);
    const plano = planejarRestauracao(atual, dados([perfil('2999-01-01T00:00:00.000Z', 190)], []), 'mesclar', { profile: 'usar-backup' });
    await aplicarRestauracao(plano, banco);
    expect((await lerPerfil(banco))?.heightCm).toBe(190);
  });

  it('é atômica: se um passo falha, nada muda', async () => {
    await salvarPerfil({ heightCm: 170 }, banco);
    const quebrado = {
      modo: 'substituir' as const,
      profile: { acao: 'substituir' as const, limpar: true, gravar: [{} as DadosBackup['profile'][number]] },
      settings: { acao: 'nada' as const, limpar: false, gravar: [] },
    };
    await expect(aplicarRestauracao(quebrado, banco)).rejects.toThrow();
    expect((await lerPerfil(banco))?.heightCm).toBe(170);
  });
});

describe('snapshots', () => {
  it('cria, grava e verifica a cópia de segurança', async () => {
    await salvarPerfil({ heightCm: 170 }, banco);
    const snapshot = await criarSnapshot('before-restore', banco);
    expect(snapshot.recordCounts.profile).toBe(1);
    const verificacao = await verificarSnapshot(snapshot.id, banco);
    expect(verificacao.ok).toBe(true);
    expect((await listarSnapshots(banco)).map((s) => s.id)).toEqual([snapshot.id]);
  });

  it('o snapshot não altera a data do último backup', async () => {
    await criarSnapshot('before-restore', banco);
    expect((await lerConfiguracoes(banco)).lastBackupAt).toBeNull();
  });

  it('detecta um snapshot corrompido', async () => {
    await salvarPerfil({ heightCm: 170 }, banco);
    const snapshot = await criarSnapshot('before-restore', banco);
    await banco.snapshots.update(snapshot.id, { payload: snapshot.payload.replace('170', '171') });
    const verificacao = await verificarSnapshot(snapshot.id, banco);
    expect(verificacao.ok).toBe(false);
  });

  it('mantém só os últimos snapshots', async () => {
    for (let i = 0; i < MAX_SNAPSHOTS + 2; i += 1) {
      await criarSnapshot('before-restore', banco, new Date(2026, 0, 1 + i));
    }
    expect(await listarSnapshots(banco)).toHaveLength(MAX_SNAPSHOTS);
  });

  it('permite excluir um snapshot', async () => {
    const snapshot = await criarSnapshot('before-restore', banco);
    await excluirSnapshot(snapshot.id, banco);
    expect(await listarSnapshots(banco)).toEqual([]);
  });

  it('desfazer: restaurar o snapshot devolve os dados anteriores', async () => {
    await salvarPerfil({ heightCm: 170 }, banco);
    const snapshot = await criarSnapshot('before-restore', banco);
    await salvarPerfil({ heightCm: 199 }, banco);
    const verificacao = await verificarSnapshot(snapshot.id, banco);
    if (!verificacao.ok) throw new Error('snapshot inválido');
    const plano = planejarRestauracao(await lerDadosAtuais(banco), verificacao.backup.data, 'substituir', { profile: 'mais-recente' });
    await aplicarRestauracao(plano, banco);
    expect((await lerPerfil(banco))?.heightCm).toBe(170);
  });
});
