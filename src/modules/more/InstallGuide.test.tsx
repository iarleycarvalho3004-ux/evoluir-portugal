import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { iniciarCapturaDeInstalacao } from '../../core/pwa/promptInstalacao';
import { InstallBadge, InstallGuide } from './InstallGuide';

afterEach(cleanup);

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1';
const CHROME_ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const SAMSUNG =
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36';
const FIREFOX = 'Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0';
const DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36';

const web = (userAgent: string, maxTouchPoints = 5) => ({ standalone: false, userAgent, maxTouchPoints });
const instalado = { standalone: true, userAgent: IPHONE, maxTouchPoints: 5 };

describe('InstallGuide por sistema', () => {
  it('mostra o passo a passo do Safari no iPhone', () => {
    render(<InstallGuide ambiente={web(IPHONE)} />);
    expect(screen.getByRole('heading', { name: 'Instalar na Tela de Início' })).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText(/Instale antes de registrar/)).toBeTruthy();
    expect(screen.getByText(/Compartilhar/)).toBeTruthy();
  });

  it('mostra o passo a passo do Chrome no Android', () => {
    render(<InstallGuide ambiente={web(CHROME_ANDROID)} />);
    expect(screen.getByRole('heading', { name: 'Instalar na tela inicial' })).toBeTruthy();
    expect(screen.getByText(/três pontinhos/)).toBeTruthy();
    expect(screen.getByText(/Instalar app/)).toBeTruthy();
    expect(screen.queryByText(/Compartilhar/)).toBeNull();
  });

  it('mostra o passo a passo do Samsung Internet', () => {
    render(<InstallGuide ambiente={web(SAMSUNG)} />);
    expect(screen.getByText(/Samsung Internet/)).toBeTruthy();
  });

  it('mostra o passo a passo do Firefox no Android', () => {
    render(<InstallGuide ambiente={web(FIREFOX)} />);
    expect(screen.getByText(/Firefox/)).toBeTruthy();
  });

  it('orienta a usar o Safari em outros navegadores do iPhone', () => {
    render(<InstallGuide ambiente={web(IPHONE.replace('Version/17.0', 'CriOS/120.0'))} />);
    expect(screen.getByText(/Abra este endereço no Safari/)).toBeTruthy();
  });

  it('orienta o computador a usar o celular', () => {
    render(<InstallGuide ambiente={web(DESKTOP, 0)} />);
    expect(screen.getByText(/No computador, o app funciona direto no navegador/)).toBeTruthy();
  });

  it('não mostra o guia quando o app já está instalado', () => {
    const { container } = render(<InstallGuide ambiente={instalado} />);
    expect(container.textContent).toBe('');
  });
});

describe('instalação com um toque no Chrome do Android', () => {
  it('oferece "Instalar agora" quando o navegador libera o aviso', async () => {
    iniciarCapturaDeInstalacao();
    const prompt = vi.fn(async () => {});
    render(<InstallGuide ambiente={web(CHROME_ANDROID)} />);
    expect(screen.queryByRole('button', { name: 'Instalar agora' })).toBeNull();

    act(() => {
      window.dispatchEvent(Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
        prompt,
        userChoice: Promise.resolve({ outcome: 'accepted' as const }),
      }));
    });
    const botao = await screen.findByRole('button', { name: 'Instalar agora' });
    await act(async () => {
      fireEvent.click(botao);
    });
    expect(prompt).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Instalar agora' })).toBeNull();
  });
});

describe('InstallBadge', () => {
  it('mostra um selo discreto quando instalado', () => {
    render(<InstallBadge ambiente={instalado} />);
    expect(screen.getByText('App instalado na Tela de Início')).toBeTruthy();
  });

  it('não aparece fora do app instalado', () => {
    const { container } = render(<InstallBadge ambiente={web(IPHONE)} />);
    expect(container.textContent).toBe('');
  });
});
