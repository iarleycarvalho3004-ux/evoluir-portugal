import { describe, expect, it } from 'vitest';
import { detectarInstalacao } from './instalacao';

const SAFARI_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const CHROME_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0 Mobile/15E148 Safari/604.1';
const SAFARI_IPAD_MODO_DESKTOP =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const CHROME_WINDOWS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36';

describe('detectarInstalacao', () => {
  it('reconhece o app instalado', () => {
    expect(detectarInstalacao({ standalone: true, userAgent: SAFARI_IPHONE, maxTouchPoints: 5 })).toBe('instalado');
  });

  it('reconhece o Safari do iPhone', () => {
    expect(detectarInstalacao({ standalone: false, userAgent: SAFARI_IPHONE, maxTouchPoints: 5 })).toBe('ios-safari');
  });

  it('reconhece o iPad em modo desktop', () => {
    expect(detectarInstalacao({ standalone: false, userAgent: SAFARI_IPAD_MODO_DESKTOP, maxTouchPoints: 5 })).toBe(
      'ios-safari',
    );
  });

  it('reconhece outro navegador no iPhone', () => {
    expect(detectarInstalacao({ standalone: false, userAgent: CHROME_IPHONE, maxTouchPoints: 5 })).toBe('ios-outro');
  });

  it('trata computador como "outro"', () => {
    expect(detectarInstalacao({ standalone: false, userAgent: CHROME_WINDOWS, maxTouchPoints: 0 })).toBe('outro');
  });
});
