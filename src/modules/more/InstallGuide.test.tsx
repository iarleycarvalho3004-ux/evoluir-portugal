import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { InstallGuide } from './InstallGuide';

afterEach(cleanup);

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1';

describe('InstallGuide', () => {
  it('mostra o passo a passo no Safari do iPhone', () => {
    render(<InstallGuide ambiente={{ standalone: false, userAgent: IPHONE, maxTouchPoints: 5 }} />);
    expect(screen.getByRole('heading', { name: 'Instalar na Tela de Início' })).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText(/Instale antes de registrar/)).toBeTruthy();
  });

  it('confirma quando o app já está instalado', () => {
    render(<InstallGuide ambiente={{ standalone: true, userAgent: IPHONE, maxTouchPoints: 5 }} />);
    expect(screen.getByRole('heading', { name: 'App instalado' })).toBeTruthy();
  });

  it('orienta a usar o Safari em outros navegadores do iPhone', () => {
    const chrome = IPHONE.replace('Version/17.0', 'CriOS/120.0');
    render(<InstallGuide ambiente={{ standalone: false, userAgent: chrome, maxTouchPoints: 5 }} />);
    expect(screen.getByText(/Abra este endereço no Safari/)).toBeTruthy();
  });
});
