import { obterBanco } from '../db/db';
import type { EvoluirDB } from '../db/db';
import { jsonCanonico } from './canonico';
import type { BackupArquivo, DadosBackup } from './formato';

export type Modo = 'mesclar' | 'substituir';
export type EscolhaConflito = 'mais-recente' | 'manter-atual' | 'usar-backup';
export type Escolhas = { profile: EscolhaConflito };

export type AcaoTabela = 'nada' | 'adicionar' | 'atualizar' | 'manter' | 'substituir';
export type PlanoTabela<T> = { acao: AcaoTabela; limpar: boolean; gravar: T[] };
export type PlanoRestauracao = {
  modo: Modo;
  profile: PlanoTabela<DadosBackup['profile'][number]>;
  settings: PlanoTabela<DadosBackup['settings'][number]>;
};

export type Conflito = { tabela: 'profile'; atualEm: string; backupEm: string };

export type Previa = {
  exportadoEm: string;
  versaoApp: string;
  contagens: { profile: { backup: number; atual: number }; settings: { backup: number; atual: number } };
  periodo: { inicio: string | null; fim: string | null };
  conflitos: Conflito[];
};

function maxIso(a: string | null, b: string | null): string | null {
  if (a === null) return b;
  if (b === null) return a;
  return a >= b ? a : b;
}

/** Conflito de perfil: existe nos dois lados e o conteúdo é diferente. */
export function detectarConflitos(atual: DadosBackup, doBackup: DadosBackup): Conflito[] {
  const a = atual.profile[0];
  const b = doBackup.profile[0];
  if (a && b && jsonCanonico(a) !== jsonCanonico(b)) {
    return [{ tabela: 'profile', atualEm: a.updatedAt, backupEm: b.updatedAt }];
  }
  return [];
}

export function gerarPrevia(atual: DadosBackup, backup: BackupArquivo): Previa {
  const datas = [...backup.data.profile, ...backup.data.settings].flatMap((r) => [r.createdAt, r.updatedAt]).sort();
  return {
    exportadoEm: backup.exportedAt,
    versaoApp: backup.appVersion,
    contagens: {
      profile: { backup: backup.data.profile.length, atual: atual.profile.length },
      settings: { backup: backup.data.settings.length, atual: atual.settings.length },
    },
    periodo: { inicio: datas[0] ?? null, fim: datas[datas.length - 1] ?? null },
    conflitos: detectarConflitos(atual, backup.data),
  };
}

/**
 * Decide, sem gravar nada, o que cada tabela vai receber. Regras por tipo de dado:
 *  - perfil (registro único): conflito resolvido pela escolha do usuário; padrão é manter o alterado por último;
 *  - configurações: ficam as deste aparelho, exceto a data do último backup, que fica a mais recente.
 * Para tabelas com relacionamentos, as regras entram aqui junto com o módulo (e a lista RELACOES).
 */
export function planejarRestauracao(
  atual: DadosBackup,
  doBackup: DadosBackup,
  modo: Modo,
  escolhas: Escolhas,
  agora: Date = new Date(),
): PlanoRestauracao {
  if (modo === 'substituir') {
    return {
      modo,
      profile: { acao: 'substituir', limpar: true, gravar: [...doBackup.profile] },
      settings: { acao: 'substituir', limpar: true, gravar: [...doBackup.settings] },
    };
  }

  const perfilAtual = atual.profile[0];
  const perfilBackup = doBackup.profile[0];
  let profile: PlanoRestauracao['profile'] = { acao: 'nada', limpar: false, gravar: [] };
  if (perfilBackup && !perfilAtual) {
    profile = { acao: 'adicionar', limpar: false, gravar: [perfilBackup] };
  } else if (perfilBackup && perfilAtual) {
    if (jsonCanonico(perfilAtual) === jsonCanonico(perfilBackup)) {
      profile = { acao: 'manter', limpar: false, gravar: [] };
    } else {
      const usarBackup =
        escolhas.profile === 'usar-backup' ||
        (escolhas.profile === 'mais-recente' && perfilBackup.updatedAt > perfilAtual.updatedAt);
      profile = usarBackup
        ? { acao: 'atualizar', limpar: false, gravar: [perfilBackup] }
        : { acao: 'manter', limpar: false, gravar: [] };
    }
  }

  const configAtual = atual.settings[0];
  const configBackup = doBackup.settings[0];
  let settings: PlanoRestauracao['settings'] = { acao: 'nada', limpar: false, gravar: [] };
  if (configBackup && !configAtual) {
    settings = { acao: 'adicionar', limpar: false, gravar: [configBackup] };
  } else if (configBackup && configAtual) {
    const ultimo = maxIso(configAtual.lastBackupAt, configBackup.lastBackupAt);
    settings =
      ultimo === configAtual.lastBackupAt
        ? { acao: 'manter', limpar: false, gravar: [] }
        : { acao: 'atualizar', limpar: false, gravar: [{ ...configAtual, lastBackupAt: ultimo, updatedAt: agora.toISOString() }] };
  }

  return { modo, profile, settings };
}

/** Aplica o plano numa única transação: se qualquer passo falhar, nada é alterado. */
export async function aplicarRestauracao(plano: PlanoRestauracao, banco: EvoluirDB = obterBanco()): Promise<void> {
  await banco.transaction('rw', banco.profile, banco.settings, async () => {
    if (plano.profile.limpar) await banco.profile.clear();
    if (plano.profile.gravar.length > 0) await banco.profile.bulkPut(plano.profile.gravar);
    if (plano.settings.limpar) await banco.settings.clear();
    if (plano.settings.gravar.length > 0) await banco.settings.bulkPut(plano.settings.gravar);
  });
}
