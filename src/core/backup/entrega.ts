export type ResultadoEntrega = 'compartilhado' | 'baixado' | 'cancelado';

type NavegadorComShare = Navigator & { canShare?: (dados: ShareData) => boolean };

/**
 * Entrega o arquivo ao usuário: folha de compartilhamento (iPhone/Android, para salvar em Arquivos)
 * ou download direto quando o compartilhamento de arquivos não existe.
 * Deve ser chamada diretamente de um toque, para o iOS aceitar a folha de compartilhamento.
 */
export async function entregarArquivo(nome: string, conteudo: string, tipo = 'application/json'): Promise<ResultadoEntrega> {
  const arquivo = new File([conteudo], nome, { type: tipo });
  const nav = navigator as NavegadorComShare;

  if (typeof nav.share === 'function' && nav.canShare?.({ files: [arquivo] })) {
    try {
      await nav.share({ files: [arquivo], title: 'Backup EVOLUIR PORTUGAL' });
      return 'compartilhado';
    } catch (erro) {
      if (erro instanceof Error && erro.name === 'AbortError') return 'cancelado';
      throw erro;
    }
  }

  const url = URL.createObjectURL(arquivo);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'baixado';
}

/** Lê um arquivo como texto (File.text quando existe, FileReader como reserva). */
export function lerTextoDoArquivo(arquivo: Blob): Promise<string> {
  if (typeof arquivo.text === 'function') return arquivo.text();
  return new Promise((resolver, rejeitar) => {
    const leitor = new FileReader();
    leitor.onload = () => resolver(String(leitor.result ?? ''));
    leitor.onerror = () => rejeitar(leitor.error ?? new Error('Falha ao ler o arquivo.'));
    leitor.readAsText(arquivo);
  });
}
