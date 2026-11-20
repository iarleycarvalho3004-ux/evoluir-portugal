export type Ambiente = { standalone: boolean; userAgent: string; maxTouchPoints: number };
export type SistemaOperacional = 'ios' | 'android' | 'outro';
export type EstadoInstalacao =
  | 'instalado'
  | 'ios-safari'
  | 'ios-outro'
  | 'android-chrome'
  | 'android-samsung'
  | 'android-firefox'
  | 'outro';

const NAVEGADORES_IOS_ALTERNATIVOS = /CriOS|FxiOS|EdgiOS|OPiOS|GSA\//;

export function detectarSistema(ambiente: Ambiente): SistemaOperacional {
  const { userAgent, maxTouchPoints } = ambiente;
  if (/iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(userAgent)) return 'android';
  return 'outro';
}

export function detectarInstalacao(ambiente: Ambiente): EstadoInstalacao {
  if (ambiente.standalone) return 'instalado';
  const sistema = detectarSistema(ambiente);
  if (sistema === 'ios') return NAVEGADORES_IOS_ALTERNATIVOS.test(ambiente.userAgent) ? 'ios-outro' : 'ios-safari';
  if (sistema === 'android') {
    if (/SamsungBrowser/.test(ambiente.userAgent)) return 'android-samsung';
    if (/Firefox/.test(ambiente.userAgent)) return 'android-firefox';
    return 'android-chrome';
  }
  return 'outro';
}

export function lerAmbiente(): Ambiente {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return {
    standalone: nav.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches === true,
    userAgent: nav.userAgent,
    maxTouchPoints: nav.maxTouchPoints,
  };
}
