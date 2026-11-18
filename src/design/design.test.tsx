import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Apple } from 'lucide-react';
import { Button, EmptyState, ProgressBar, ScreenHeader, Stat } from './index';

afterEach(cleanup);

describe('ProgressBar', () => {
  it('limita o valor entre 0 e o máximo', () => {
    render(<ProgressBar value={150} max={100} label="Meta" />);
    expect(screen.getByRole('progressbar', { name: 'Meta' }).getAttribute('aria-valuenow')).toBe('100');
    cleanup();
    render(<ProgressBar value={-5} label="Meta" />);
    expect(screen.getByRole('progressbar', { name: 'Meta' }).getAttribute('aria-valuenow')).toBe('0');
  });

  it('trata valores inválidos como zero', () => {
    render(<ProgressBar value={Number.NaN} label="Meta" />);
    expect(screen.getByRole('progressbar', { name: 'Meta' }).getAttribute('aria-valuenow')).toBe('0');
  });
});

describe('Stat', () => {
  it('mostra "sem dados" quando o valor é nulo', () => {
    render(<Stat label="Peso atual" value={null} />);
    expect(screen.getByRole('img', { name: 'sem dados' })).toBeTruthy();
  });

  it('mostra valor e unidade quando existem', () => {
    render(<Stat label="Peso atual" value="80,5" unit="kg" />);
    expect(screen.getByText('80,5', { exact: false })).toBeTruthy();
    expect(screen.getByText('kg')).toBeTruthy();
  });
});

describe('Button', () => {
  it('renderiza um botão quando não há rota', () => {
    render(
      <MemoryRouter>
        <Button>Salvar</Button>
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeTruthy();
  });

  it('renderiza um link quando recebe uma rota', () => {
    render(
      <MemoryRouter>
        <Button to="/treino">Ir ao treino</Button>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Ir ao treino' }).getAttribute('href')).toBe('/treino');
  });
});

describe('EmptyState e ScreenHeader', () => {
  it('mostra a versão em que a função será desenvolvida', () => {
    render(<EmptyState icon={Apple} title="Título" description="Descrição." availableIn="V2.0" />);
    expect(screen.getByText('Iarley vai desenvolver na V2.0')).toBeTruthy();
  });

  it('mostra o título da tela como cabeçalho principal', () => {
    render(<ScreenHeader title="Nutrição" subtitle="Suas refeições" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Nutrição' })).toBeTruthy();
  });
});
