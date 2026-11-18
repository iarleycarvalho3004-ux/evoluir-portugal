export type Ambiente = { standalone: boolean; userAgent: string; maxTouchPoints: number };
export type EstadoInstalacao = 'instalado' | 'ios-safari' | 'ios-outro' | 'outro';

const NAVEGADORES_IOS_ALTERNATIVOS = /CriOS|FxiOS|EdgiOS|OPiOS|GSA\//;

export function detectarInstalacao(ambiente: Ambiente): EstadoInstalacao {
  if (ambiente.standalone) return 'instalado';
  const { userAgent, maxTouchPoints } = ambiente;
  const ios = /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1);
  if (!ios) return 'outro';
  return NAVEGADORES_IOS_ALTERNATIVOS.test(userAgent) ? 'ios-outro' : 'ios-safari';
}

export function lerAmbiente(): Ambiente {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return {
    standalone: nav.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches === true,
    userAgent: nav.userAgent,
    maxTouchPoints: nav.maxTouchPoints,
  };
}
