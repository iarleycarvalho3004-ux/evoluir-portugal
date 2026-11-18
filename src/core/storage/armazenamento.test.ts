import { describe, expect, it } from 'vitest';
import {
  consultarPersistencia,
  estimarEspaco,
  formatarBytes,
  nivelDeEspaco,
  solicitarPersistencia,
} from './armazenamento';
import { avaliarBackup } from './avisoBackup';

function gerenciador(parcial: Partial<StorageManager>): StorageManager {
  return parcial as unknown as StorageManager;
}

describe('nivelDeEspaco', () => {
  it('classifica pelos limites de 70% e 90%', () => {
    expect(nivelDeEspaco(69, 100)).toBe('ok');
    expect(nivelDeEspaco(70, 100)).toBe('aviso');
    expect(nivelDeEspaco(89, 100)).toBe('aviso');
    expect(nivelDeEspaco(90, 100)).toBe('critico');
  });

  it('trata cota inválida como ok', () => {
    expect(nivelDeEspaco(10, 0)).toBe('ok');
  });
});

describe('persistência', () => {
  it('informa indisponível quando o navegador não oferece a API', async () => {
    expect(await consultarPersistencia(undefined)).toBe('indisponivel');
    expect(await solicitarPersistencia(undefined)).toBe('indisponivel');
  });

  it('consulta o estado atual', async () => {
    expect(await consultarPersistencia(gerenciador({ persisted: async () => true }))).toBe('concedida');
    expect(await consultarPersistencia(gerenciador({ persisted: async () => false }))).toBe('nao-concedida');
  });

  it('pede persistência e mostra o resultado real', async () => {
    const negado = gerenciador({ persisted: async () => false, persist: async () => false });
    const aceito = gerenciador({ persisted: async () => false, persist: async () => true });
    expect(await solicitarPersistencia(negado)).toBe('nao-concedida');
    expect(await solicitarPersistencia(aceito)).toBe('concedida');
  });

  it('não pede de novo quando já foi concedida', async () => {
    let pedidos = 0;
    const jaConcedido = gerenciador({
      persisted: async () => true,
      persist: async () => {
        pedidos += 1;
        return true;
      },
    });
    expect(await solicitarPersistencia(jaConcedido)).toBe('concedida');
    expect(pedidos).toBe(0);
  });

  it('trata falhas como indisponível', async () => {
    const quebrado = gerenciador({
      persisted: async () => {
        throw new Error('falha');
      },
    });
    expect(await consultarPersistencia(quebrado)).toBe('indisponivel');
  });
});

describe('estimarEspaco', () => {
  it('calcula a fração e o nível', async () => {
    const espaco = await estimarEspaco(gerenciador({ estimate: async () => ({ usage: 80, quota: 100 }) }));
    expect(espaco).toEqual({ usado: 80, quota: 100, fracao: 0.8, nivel: 'aviso' });
  });

  it('devolve null quando não há estimativa', async () => {
    expect(await estimarEspaco(undefined)).toBeNull();
    expect(await estimarEspaco(gerenciador({ estimate: async () => ({}) }))).toBeNull();
  });
});

describe('formatarBytes', () => {
  it('formata tamanhos', () => {
    expect(formatarBytes(0)).toBe('0 B');
    expect(formatarBytes(1536)).toMatch(/^1[.,]5 KB$/);
    expect(formatarBytes(5 * 1024 * 1024)).toMatch(/^5 MB$/);
  });

  it('trata valores inválidos', () => {
    expect(formatarBytes(-1)).toBe('—');
    expect(formatarBytes(Number.NaN)).toBe('—');
  });
});

describe('avaliarBackup', () => {
  const agora = new Date('2026-11-18T12:00:00.000Z');

  it('avisa quando nunca houve backup', () => {
    expect(avaliarBackup(null, agora, 7)).toEqual({ tipo: 'nunca' });
  });

  it('considera em dia dentro do limite', () => {
    expect(avaliarBackup('2026-11-15T12:00:00.000Z', agora, 7)).toEqual({ tipo: 'em-dia', dias: 3 });
  });

  it('avisa quando passou do limite', () => {
    expect(avaliarBackup('2026-11-01T12:00:00.000Z', agora, 7)).toEqual({ tipo: 'desatualizado', dias: 17 });
  });

  it('trata data inválida como nunca', () => {
    expect(avaliarBackup('lixo', agora, 7)).toEqual({ tipo: 'nunca' });
  });
});
