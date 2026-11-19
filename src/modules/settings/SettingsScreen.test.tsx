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

  it('salva medidas, objetivo e restrições, e os dados persistem no banco', async () => {
    abrir('/mais/configuracoes');
    fireEvent.change(await screen.findByLabelText('Altura (cm)'), { target: { value: '178,5' } });
    fireEvent.change(screen.getByLabelText('Peso atual (kg)'), { target: { value: '80' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Hipertrofia' }));
    expect(screen.getByText(/Ganhar massa muscular/)).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Lactose' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Perfil salvo neste aparelho.')).toBeTruthy();
    expect(await lerPerfil()).toMatchObject({
      heightCm: 178.5,
      currentWeightKg: 80,
      goal: 'hypertrophy',
      dietaryRestrictions: ['Lactose'],
    });
  });

  it('mostra IMC calculado com os valores digitados', async () => {
    abrir('/mais/configuracoes');
    fireEvent.change(await screen.findByLabelText('Altura (cm)'), { target: { value: '180' } });
    fireEvent.change(screen.getByLabelText('Peso atual (kg)'), { target: { value: '81' } });
    expect(screen.getByText('IMC 25')).toBeTruthy();
  });

  it('permite informar só a idade aproximada', async () => {
    abrir('/mais/configuracoes');
    await screen.findByLabelText('Data de nascimento');
    fireEvent.click(screen.getByRole('radio', { name: 'Idade' }));
    fireEvent.change(screen.getByLabelText('Idade aproximada (anos)'), { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Perfil salvo neste aparelho.')).toBeTruthy();
    expect((await lerPerfil())?.approxAge).toBe(30);
  });

  it('mostra o erro e não grava dados inválidos', async () => {
    abrir('/mais/configuracoes');
    fireEvent.change(await screen.findByLabelText('Altura (cm)'), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Informe uma altura entre 100 e 250 cm.')).toBeTruthy();
    expect(await lerPerfil()).toBeNull();
  });

  it('descarta as alterações não salvas', async () => {
    abrir('/mais/configuracoes');
    const altura = (await screen.findByLabelText('Altura (cm)')) as HTMLInputElement;
    fireEvent.change(altura, { target: { value: '170' } });
    expect(screen.getByText('Alterações não salvas')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(altura.value).toBe('');
    expect(screen.queryByText('Alterações não salvas')).toBeNull();
  });

  it('apaga o perfil depois de confirmar', async () => {
    abrir('/mais/configuracoes');
    fireEvent.change(await screen.findByLabelText('Altura (cm)'), { target: { value: '170' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await screen.findByText('Perfil salvo neste aparelho.');
    fireEvent.click(screen.getByRole('button', { name: 'Apagar perfil' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }));
    expect(await screen.findByText('Perfil apagado deste aparelho.')).toBeTruthy();
    expect(await lerPerfil()).toBeNull();
  });

  it('mostra o estado do backup e a ressalva sobre o armazenamento', async () => {
    abrir('/mais/configuracoes');
    expect(await screen.findByText('Nunca feito')).toBeTruthy();
    expect(screen.getByText(/Nada disso substitui o backup/)).toBeTruthy();
  });
});
