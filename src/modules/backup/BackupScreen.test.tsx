import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../app/App';
import { criarBackup } from '../../core/backup/exportar';
import { listarSnapshots } from '../../core/backup/snapshots';
import { EvoluirDB, obterBanco } from '../../core/db/db';
import { lerConfiguracoes, lerPerfil, salvarPerfil } from '../../core/db/repositorios';

let origem: EvoluirDB;

beforeEach(async () => {
  const banco = obterBanco();
  await banco.profile.clear();
  await banco.settings.clear();
  await banco.snapshots.clear();
  origem = new EvoluirDB(`origem-${Math.random().toString(36).slice(2)}`);
  URL.createObjectURL = vi.fn(() => 'blob:teste');
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(async () => {
  cleanup();
  vi.restoreAllMocks();
  await origem.delete();
});

function abrir() {
  return render(
    <MemoryRouter initialEntries={['/mais/backup']}>
      <App />
    </MemoryRouter>,
  );
}

async function arquivoDeBackup(alturaCm: number): Promise<File> {
  await salvarPerfil({ heightCm: alturaCm }, origem);
  const { texto } = await criarBackup(origem);
  return new File([texto], 'meu-backup.json', { type: 'application/json' });
}

function escolher(arquivo: File) {
  fireEvent.change(screen.getByLabelText('Escolher arquivo de backup'), { target: { files: [arquivo] } });
}

describe('exportar', () => {
  it('gera o backup, entrega o arquivo e registra a data', async () => {
    await salvarPerfil({ heightCm: 178 });
    abrir();
    fireEvent.click(await screen.findByRole('button', { name: 'Gerar backup' }));
    expect(await screen.findByText(/integridade verificada/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar em Arquivos' }));
    expect(await screen.findByText(/Backup entregue/)).toBeTruthy();
    expect((await lerConfiguracoes()).lastBackupAt).not.toBeNull();
  });
});

describe('restaurar', () => {
  it('recusa um arquivo inválido sem alterar nada', async () => {
    await salvarPerfil({ heightCm: 170 });
    abrir();
    await screen.findByLabelText('Escolher arquivo de backup');
    escolher(new File(['isto não é um backup'], 'lixo.json'));
    expect(await screen.findByText(/não é um JSON válido/)).toBeTruthy();
    expect((await lerPerfil())?.heightCm).toBe(170);
  });

  it('segue o caminho completo: revisar, proteger, confirmar e restaurar', async () => {
    const arquivo = await arquivoDeBackup(190);
    await salvarPerfil({ heightCm: 150 });
    abrir();
    await screen.findByLabelText('Escolher arquivo de backup');
    escolher(arquivo);
    expect(await screen.findByText('Arquivo íntegro')).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: 'Substituir tudo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(await screen.findByText('Cópia de segurança criada e verificada')).toBeTruthy();
    expect((await lerPerfil())?.heightCm).toBe(150);
    expect(await listarSnapshots()).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Restaurar agora' }));
    expect(await screen.findByText('Restauração concluída')).toBeTruthy();
    expect((await lerPerfil())?.heightCm).toBe(190);
  });

  it('permite desfazer pela cópia de segurança', async () => {
    const arquivo = await arquivoDeBackup(190);
    await salvarPerfil({ heightCm: 150 });
    abrir();
    await screen.findByLabelText('Escolher arquivo de backup');
    escolher(arquivo);
    await screen.findByText('Arquivo íntegro');
    fireEvent.click(screen.getByRole('radio', { name: 'Substituir tudo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Restaurar agora' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Desfazer restauração' }));
    expect(await screen.findByText('Restauração desfeita')).toBeTruthy();
    expect((await lerPerfil())?.heightCm).toBe(150);
  });

  it('cancelar na confirmação não altera os dados', async () => {
    const arquivo = await arquivoDeBackup(190);
    await salvarPerfil({ heightCm: 150 });
    abrir();
    await screen.findByLabelText('Escolher arquivo de backup');
    escolher(arquivo);
    await screen.findByText('Arquivo íntegro');
    fireEvent.click(screen.getByRole('radio', { name: 'Substituir tudo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    await screen.findByRole('button', { name: 'Restaurar agora' });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(await screen.findByLabelText('Escolher arquivo de backup')).toBeTruthy();
    expect((await lerPerfil())?.heightCm).toBe(150);
  });

  it('ao mesclar, mostra o conflito de perfil e respeita a escolha', async () => {
    const arquivo = await arquivoDeBackup(190);
    await salvarPerfil({ heightCm: 150 });
    abrir();
    await screen.findByLabelText('Escolher arquivo de backup');
    escolher(arquivo);
    await screen.findByText('Arquivo íntegro');
    expect(screen.getByText('O perfil do backup é diferente do deste aparelho')).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: 'Manter o deste aparelho' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Restaurar agora' }));
    await screen.findByText('Restauração concluída');
    expect((await lerPerfil())?.heightCm).toBe(150);
  });
});
