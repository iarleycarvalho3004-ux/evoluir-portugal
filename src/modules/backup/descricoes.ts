import type { PlanoRestauracao } from '../../core/backup/restaurar';

/** Frases simples sobre o que a restauração vai fazer, para o usuário confirmar. */
export function descreverPlano(plano: PlanoRestauracao): string[] {
  const perfil: Record<PlanoRestauracao['profile']['acao'], string> = {
    nada: 'Perfil: sem alterações.',
    adicionar: 'Perfil: o perfil do backup será adicionado.',
    atualizar: 'Perfil: o perfil deste aparelho será atualizado com o do backup.',
    manter: 'Perfil: o perfil deste aparelho será mantido.',
    substituir:
      plano.profile.gravar.length > 0
        ? 'Perfil: será substituído pelo do backup.'
        : 'Perfil: será removido, porque o backup não tem perfil.',
  };
  const configuracoes: Record<PlanoRestauracao['settings']['acao'], string> = {
    nada: 'Configurações: sem alterações.',
    adicionar: 'Configurações: as do backup serão adicionadas.',
    atualizar: 'Configurações: mantidas, com a data de backup mais recente.',
    manter: 'Configurações: as deste aparelho serão mantidas.',
    substituir:
      plano.settings.gravar.length > 0
        ? 'Configurações: serão substituídas pelas do backup.'
        : 'Configurações: serão redefinidas, porque o backup não tem configurações.',
  };
  return [perfil[plano.profile.acao], configuracoes[plano.settings.acao]];
}
