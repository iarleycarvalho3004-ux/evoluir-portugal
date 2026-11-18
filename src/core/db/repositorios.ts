import { obterBanco } from './db';
import type { EvoluirDB } from './db';
import { profileInputSchema } from './schemas';
import type { ProfileInput } from './schemas';
import type { Profile, Settings } from './types';

export async function lerPerfil(banco: EvoluirDB = obterBanco()): Promise<Profile | null> {
  return (await banco.profile.get('main')) ?? null;
}

/** Valida e grava o perfil numa transação. Dados inválidos lançam erro e nada é gravado. */
export async function salvarPerfil(dados: ProfileInput, banco: EvoluirDB = obterBanco()): Promise<Profile> {
  const validado = profileInputSchema.parse(dados);
  return banco.transaction('rw', banco.profile, async () => {
    const atual = await banco.profile.get('main');
    const agora = new Date().toISOString();
    const novo: Profile = {
      id: 'main',
      ...validado,
      createdAt: atual?.createdAt ?? agora,
      updatedAt: agora,
    };
    await banco.profile.put(novo);
    return novo;
  });
}

export async function apagarPerfil(banco: EvoluirDB = obterBanco()): Promise<void> {
  await banco.profile.delete('main');
}

/** Lê as configurações, criando os valores padrão na primeira leitura. */
export async function lerConfiguracoes(banco: EvoluirDB = obterBanco()): Promise<Settings> {
  return banco.transaction('rw', banco.settings, async () => {
    const atual = await banco.settings.get('main');
    if (atual) return atual;
    const agora = new Date().toISOString();
    const padrao: Settings = {
      id: 'main',
      lastBackupAt: null,
      backupReminderDays: 7,
      createdAt: agora,
      updatedAt: agora,
    };
    await banco.settings.put(padrao);
    return padrao;
  });
}
