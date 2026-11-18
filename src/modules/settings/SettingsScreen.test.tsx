import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../app/App';
import { obterBanco } from '../../core/db/db';
import { lerPerfil } from '../../core/db/repositorios';

beforeEach(async () => {
  const banco = obterBanco();
  await banco.profile.clear();
  await banco.settings.clear();
});

afterEach(cleanup);

function abrir(rota: string) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <App />
    </MemoryRouter>,
  );
}

describe('Configurações', () => {
  it('abre pela tela Mais', async () => {
    abrir('/mais');
    fireEvent.click(screen.getByRole('link', { name: /Configurações/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Configurações' })).toBeTruthy();
  });

  it('salva o perfil e os dados persistem no banco', async () => {
    abrir('/mais/configuracoes');
    const altura = await screen.findByLabelText('Altura (cm)');
    fireEvent.change(altura, { target: { value: '178,5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    expect(await screen.findByText('Perfil salvo neste aparelho.')).toBeTruthy();
    expect((await lerPerfil())?.heightCm).toBe(178.5);
  });

  it('mostra o erro e não grava dados inválidos', async () => {
    abrir('/mais/configuracoes');
    const altura = await screen.findByLabelText('Altura (cm)');
    fireEvent.change(altura, { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    expect(await screen.findByText('Informe uma altura entre 100 e 250 cm.')).toBeTruthy();
    expect(await lerPerfil()).toBeNull();
  });

  it('apaga o perfil depois de confirmar', async () => {
    abrir('/mais/configuracoes');
    fireEvent.change(await screen.findByLabelText('Altura (cm)'), { target: { value: '170' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    await screen.findByText('Perfil salvo neste aparelho.');
    fireEvent.click(screen.getByRole('button', { name: 'Apagar perfil' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }));
    expect(await screen.findByText('Perfil apagado deste aparelho.')).toBeTruthy();
    expect(await lerPerfil()).toBeNull();
  });

  it('mostra o aviso de backup e a ressalva sobre o armazenamento', async () => {
    abrir('/mais/configuracoes');
    expect(await screen.findByText('Você ainda não fez backup')).toBeTruthy();
    expect(screen.getByText(/Nada disso substitui o backup/)).toBeTruthy();
  });
});
