import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { InstallBadge, InstallGuide } from './InstallGuide';

afterEach(cleanup);

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1';
const safari = { standalone: false, userAgent: IPHONE, maxTouchPoints: 5 };
const instalado = { standalone: true, userAgent: IPHONE, maxTouchPoints: 5 };

describe('InstallGuide', () => {
  it('mostra o passo a passo no Safari do iPhone', () => {
    render(<InstallGuide ambiente={safari} />);
    expect(screen.getByRole('heading', { name: 'Instalar na Tela de Início' })).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText(/Instale antes de registrar/)).toBeTruthy();
  });

  it('não mostra o guia quando o app já está instalado', () => {
    const { container } = render(<InstallGuide ambiente={instalado} />);
    expect(container.textContent).toBe('');
  });

  it('orienta a usar o Safari em outros navegadores do iPhone', () => {
    const chrome = IPHONE.replace('Version/17.0', 'CriOS/120.0');
    render(<InstallGuide ambiente={{ standalone: false, userAgent: chrome, maxTouchPoints: 5 }} />);
    expect(screen.getByText(/Abra este endereço no Safari/)).toBeTruthy();
  });
});

describe('InstallBadge', () => {
  it('mostra um selo discreto quando instalado', () => {
    render(<InstallBadge ambiente={instalado} />);
    expect(screen.getByText('App instalado na Tela de Início')).toBeTruthy();
  });

  it('não aparece fora do app instalado', () => {
    const { container } = render(<InstallBadge ambiente={safari} />);
    expect(container.textContent).toBe('');
  });
});
