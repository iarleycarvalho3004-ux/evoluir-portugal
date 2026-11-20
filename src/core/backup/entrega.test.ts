import { afterEach, describe, expect, it, vi } from 'vitest';
import { entregarArquivo, lerTextoDoArquivo } from './entrega';

afterEach(() => {
  vi.restoreAllMocks();
  Object.assign(navigator, { share: undefined, canShare: undefined });
});

describe('entregarArquivo', () => {
  it('usa a folha de compartilhamento quando ela aceita arquivos', async () => {
    const share = vi.fn(async () => {});
    Object.assign(navigator, { share, canShare: () => true });
    expect(await entregarArquivo('backup.json', '{}')).toBe('compartilhado');
    expect(share).toHaveBeenCalledOnce();
  });

  it('informa quando o usuário cancela o compartilhamento', async () => {
    const cancelar = Object.assign(new Error('cancelado'), { name: 'AbortError' });
    Object.assign(navigator, { share: vi.fn(async () => Promise.reject(cancelar)), canShare: () => true });
    expect(await entregarArquivo('backup.json', '{}')).toBe('cancelado');
  });

  it('propaga outros erros de compartilhamento', async () => {
    Object.assign(navigator, { share: vi.fn(async () => Promise.reject(new Error('falhou'))), canShare: () => true });
    await expect(entregarArquivo('backup.json', '{}')).rejects.toThrow('falhou');
  });

  it('baixa o arquivo quando não há compartilhamento de arquivos', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:teste');
    URL.revokeObjectURL = vi.fn();
    const clique = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    expect(await entregarArquivo('backup.json', '{}')).toBe('baixado');
    expect(clique).toHaveBeenCalledOnce();
  });
});

describe('lerTextoDoArquivo', () => {
  it('lê o conteúdo de um arquivo', async () => {
    expect(await lerTextoDoArquivo(new File(['olá'], 'a.json'))).toBe('olá');
  });
});
