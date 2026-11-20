import { describe, expect, it } from 'vitest';
import { detectarInstalacao, detectarSistema } from './instalacao';

const SAFARI_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const CHROME_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0 Mobile/15E148 Safari/604.1';
const SAFARI_IPAD_MODO_DESKTOP =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const CHROME_ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const SAMSUNG =
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36';
const FIREFOX_ANDROID = 'Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0';
const CHROME_WINDOWS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36';

const web = (userAgent: string, maxTouchPoints = 5) => ({ standalone: false, userAgent, maxTouchPoints });

describe('detectarSistema', () => {
  it('reconhece iOS, Android e outros', () => {
    expect(detectarSistema(web(SAFARI_IPHONE))).toBe('ios');
    expect(detectarSistema(web(SAFARI_IPAD_MODO_DESKTOP))).toBe('ios');
    expect(detectarSistema(web(CHROME_ANDROID))).toBe('android');
    expect(detectarSistema(web(CHROME_WINDOWS, 0))).toBe('outro');
  });
});

describe('detectarInstalacao', () => {
  it('reconhece o app instalado em qualquer sistema', () => {
    expect(detectarInstalacao({ standalone: true, userAgent: SAFARI_IPHONE, maxTouchPoints: 5 })).toBe('instalado');
    expect(detectarInstalacao({ standalone: true, userAgent: CHROME_ANDROID, maxTouchPoints: 5 })).toBe('instalado');
  });

  it('reconhece o Safari e outros navegadores no iPhone', () => {
    expect(detectarInstalacao(web(SAFARI_IPHONE))).toBe('ios-safari');
    expect(detectarInstalacao(web(SAFARI_IPAD_MODO_DESKTOP))).toBe('ios-safari');
    expect(detectarInstalacao(web(CHROME_IPHONE))).toBe('ios-outro');
  });

  it('reconhece os navegadores do Android', () => {
    expect(detectarInstalacao(web(CHROME_ANDROID))).toBe('android-chrome');
    expect(detectarInstalacao(web(SAMSUNG))).toBe('android-samsung');
    expect(detectarInstalacao(web(FIREFOX_ANDROID))).toBe('android-firefox');
  });

  it('trata computador como "outro"', () => {
    expect(detectarInstalacao(web(CHROME_WINDOWS, 0))).toBe('outro');
  });
});
