export type InfoVersao = { version: string; buildTime: string };

type Buscar = typeof fetch;

/** Lê o version.json publicado. Devolve null se a leitura falhar ou o formato for inesperado. */
export async function buscarVersaoPublicada(
  buscar: Buscar = (...args) => fetch(...args),
): Promise<InfoVersao | null> {
  try {
    const resposta = await buscar(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!resposta.ok) return null;
    const dados: unknown = await resposta.json();
    if (typeof dados !== 'object' || dados === null) return null;
    const { version, buildTime } = dados as Record<string, unknown>;
    if (typeof version !== 'string' || typeof buildTime !== 'string') return null;
    return { version, buildTime };
  } catch {
    return null;
  }
}

export function existeVersaoNova(buildAtual: string, publicada: InfoVersao | null): boolean {
  return publicada !== null && publicada.buildTime !== buildAtual;
}
