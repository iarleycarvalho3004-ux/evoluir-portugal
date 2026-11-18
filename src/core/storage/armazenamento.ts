export type NivelEspaco = 'ok' | 'aviso' | 'critico';
export type EstadoPersistencia = 'concedida' | 'nao-concedida' | 'indisponivel';
export type Espaco = { usado: number; quota: number; fracao: number; nivel: NivelEspaco };

export const LIMITE_AVISO = 0.7;
export const LIMITE_CRITICO = 0.9;

export function nivelDeEspaco(usado: number, quota: number): NivelEspaco {
  if (quota <= 0) return 'ok';
  const fracao = usado / quota;
  if (fracao >= LIMITE_CRITICO) return 'critico';
  if (fracao >= LIMITE_AVISO) return 'aviso';
  return 'ok';
}

type Gerenciador = StorageManager | undefined;

export async function consultarPersistencia(armazenamento: Gerenciador = navigator.storage): Promise<EstadoPersistencia> {
  if (!armazenamento?.persisted) return 'indisponivel';
  try {
    return (await armazenamento.persisted()) ? 'concedida' : 'nao-concedida';
  } catch {
    return 'indisponivel';
  }
}

/** Pede ao navegador que trate os dados como persistentes. O iOS pode ignorar o pedido. */
export async function solicitarPersistencia(armazenamento: Gerenciador = navigator.storage): Promise<EstadoPersistencia> {
  if (!armazenamento?.persist) return 'indisponivel';
  try {
    if (await armazenamento.persisted()) return 'concedida';
    return (await armazenamento.persist()) ? 'concedida' : 'nao-concedida';
  } catch {
    return 'indisponivel';
  }
}

export async function estimarEspaco(armazenamento: Gerenciador = navigator.storage): Promise<Espaco | null> {
  if (!armazenamento?.estimate) return null;
  try {
    const { usage, quota } = await armazenamento.estimate();
    if (typeof usage !== 'number' || typeof quota !== 'number' || quota <= 0) return null;
    return { usado: usage, quota, fracao: usage / quota, nivel: nivelDeEspaco(usage, quota) };
  } catch {
    return null;
  }
}

export function formatarBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  const unidades = ['B', 'KB', 'MB', 'GB', 'TB'];
  let valor = bytes;
  let indice = 0;
  while (valor >= 1024 && indice < unidades.length - 1) {
    valor /= 1024;
    indice += 1;
  }
  const casas = indice === 0 || valor >= 100 ? 0 : 1;
  const texto = valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
  return `${texto} ${unidades[indice]}`;
}
