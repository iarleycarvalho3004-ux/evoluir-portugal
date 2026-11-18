import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { navItems } from './navigation';

afterEach(cleanup);

function renderizar(rota: string) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <App />
    </MemoryRouter>,
  );
}

describe('navegação', () => {
  it('define cinco itens com rotas únicas', () => {
    expect(navItems).toHaveLength(5);
    expect(new Set(navItems.map((item) => item.to)).size).toBe(5);
  });

  it('mostra a barra inferior com os cinco destinos', () => {
    renderizar('/');
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(nav.querySelectorAll('a')).toHaveLength(5);
  });

  it('abre cada tela pela rota correspondente', () => {
    const telas: Array<[string, string]> = [
      ['/', 'Início'],
      ['/treino', 'Treino'],
      ['/nutricao', 'Nutrição'],
      ['/evolucao', 'Evolução'],
      ['/mais', 'Mais'],
    ];
    for (const [rota, titulo] of telas) {
      renderizar(rota);
      expect(screen.getByRole('heading', { level: 1, name: titulo })).toBeTruthy();
      cleanup();
    }
  });

  it('troca de tela ao tocar na barra e marca o item ativo', () => {
    renderizar('/');
    fireEvent.click(screen.getByRole('link', { name: 'Treino' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Treino' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Treino' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Início' }).getAttribute('aria-current')).toBeNull();
  });

  it('mostra aviso para endereços inexistentes', () => {
    renderizar('/rota-que-nao-existe');
    expect(screen.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Voltar ao início' })).toBeTruthy();
  });
});
