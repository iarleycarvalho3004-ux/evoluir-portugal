/** Traduz erros do armazenamento local em mensagens claras para o usuário. */
export function descreverErroDeArmazenamento(erro: unknown): string {
  const nome = erro instanceof Error ? erro.name : '';
  if (nome === 'QuotaExceededError') {
    return 'O armazenamento deste aparelho está cheio. Libere espaço e tente de novo.';
  }
  if (['MissingAPIError', 'OpenFailedError', 'SecurityError', 'InvalidStateError'].includes(nome)) {
    return 'Este navegador não permitiu acessar o armazenamento local. Isso pode acontecer em navegação privada.';
  }
  return 'Não foi possível acessar o armazenamento deste aparelho.';
}
