import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { App } from './App';

afterEach(cleanup);

describe('App (Etapa 2A)', () => {
  it('exibe o título do projeto', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'EVOLUIR PORTUGAL' })).toBeTruthy();
  });

  it('exibe a versão e a data de geração', () => {
    render(<App />);
    expect(screen.getByText('Versão')).toBeTruthy();
    expect(screen.getByText('Gerado em')).toBeTruthy();
  });
});
