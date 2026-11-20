import { jsonCanonico, profundidadeJson } from './canonico';
import { DATA_SCHEMA_VERSION, FORMAT_VERSION, LIMITE_BYTES, LIMITE_PROFUNDIDADE, RELACOES, envelopeSchema } from './formato';
import type { BackupArquivo, Relacao } from './formato';
import { sha256Hex } from './hash';

export type CodigoErro =
  | 'grande-demais'
  | 'vazio'
  | 'profundo-demais'
  | 'json-invalido'
  | 'nao-e-backup'
  | 'versao-mais-nova'
  | 'tem-fotos'
  | 'formato-invalido'
  | 'checksum'
  | 'duplicado'
  | 'integridade';

export type ErroBackup = { codigo: CodigoErro; mensagem: string };
export type ResultadoValidacao = { ok: true; backup: BackupArquivo } | { ok: false; erro: ErroBackup };

const falha = (codigo: CodigoErro, mensagem: string): ResultadoValidacao => ({ ok: false, erro: { codigo, mensagem } });

type Tabelas = Record<string, ReadonlyArray<object>>;

/** Devolve uma descrição do problema se houver ids repetidos numa tabela. */
export function verificarDuplicatas(tabelas: Tabelas): string | null {
  for (const [nome, registros] of Object.entries(tabelas)) {
    const vistos = new Set<unknown>();
    for (const registro of registros) {
      const id = (registro as Record<string, unknown>).id;
      if (vistos.has(id)) return `A tabela ${nome} tem registros repetidos.`;
      vistos.add(id);
    }
  }
  return null;
}

/** Devolve uma descrição do problema se algum registro apontar para outro que não existe. */
export function verificarIntegridade(tabelas: Tabelas, relacoes: Relacao[]): string | null {
  for (const relacao of relacoes) {
    const ids = new Set<unknown>((tabelas[relacao.referencia] ?? []).map((r) => (r as Record<string, unknown>).id));
    for (const registro of tabelas[relacao.tabela] ?? []) {
      const valor = (registro as Record<string, unknown>)[relacao.campo];
      if (valor !== undefined && valor !== null && !ids.has(valor)) {
        return `Um registro de ${relacao.tabela} aponta para um item que não existe em ${relacao.referencia}.`;
      }
    }
  }
  return null;
}

/**
 * Valida um arquivo de backup inteiro, em memória, antes de qualquer gravação.
 * `tamanhoBytes` é o tamanho informado pelo sistema de arquivos, quando houver.
 */
export async function validarBackup(texto: string, tamanhoBytes?: number): Promise<ResultadoValidacao> {
  if ((tamanhoBytes ?? 0) > LIMITE_BYTES || texto.length > LIMITE_BYTES) {
    return falha('grande-demais', 'O arquivo é grande demais para ser um backup válido (limite de 25 MB).');
  }
  if (texto.trim() === '') return falha('vazio', 'O arquivo está vazio.');
  if (profundidadeJson(texto, LIMITE_PROFUNDIDADE) > LIMITE_PROFUNDIDADE) {
    return falha('profundo-demais', 'A estrutura do arquivo é complexa demais para ser um backup válido.');
  }

  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    return falha('json-invalido', 'O arquivo não é um JSON válido ou está corrompido.');
  }
  if (typeof bruto !== 'object' || bruto === null || Array.isArray(bruto)) {
    return falha('nao-e-backup', 'Este arquivo não é um backup do EVOLUIR PORTUGAL.');
  }

  const cabecalho = bruto as Record<string, unknown>;
  if (cabecalho.app !== 'evoluir-portugal') {
    return falha('nao-e-backup', 'Este arquivo não é um backup do EVOLUIR PORTUGAL.');
  }
  const versaoFormato = typeof cabecalho.formatVersion === 'number' ? cabecalho.formatVersion : 0;
  const versaoDados = typeof cabecalho.schemaVersion === 'number' ? cabecalho.schemaVersion : 0;
  if (versaoFormato > FORMAT_VERSION || versaoDados > DATA_SCHEMA_VERSION) {
    return falha('versao-mais-nova', 'Este backup foi feito por uma versão mais nova do app. Atualize o app e tente de novo.');
  }
  if (cabecalho.includesPhotos === true) {
    return falha('tem-fotos', 'Este backup inclui fotos, e esta versão do app ainda não restaura fotos. Nada foi alterado.');
  }

  const resultado = envelopeSchema.safeParse(bruto);
  if (!resultado.success) {
    const problema = resultado.error.issues[0];
    const onde = problema ? problema.path.join('.') : 'desconhecido';
    return falha('formato-invalido', `O arquivo tem um formato inválido (campo: ${onde}). Nada foi alterado.`);
  }
  const backup = resultado.data;

  const esperado = await sha256Hex(jsonCanonico(backup.data));
  if (esperado !== backup.checksum) {
    return falha('checksum', 'A verificação de integridade falhou: o arquivo foi alterado ou está corrompido.');
  }

  const duplicada = verificarDuplicatas(backup.data);
  if (duplicada) return falha('duplicado', duplicada);

  const quebrada = verificarIntegridade(backup.data, RELACOES);
  if (quebrada) return falha('integridade', quebrada);

  return { ok: true, backup };
}
