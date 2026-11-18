import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EvoluirDB } from './db';
import { descreverErroDeArmazenamento } from './erros';
import { apagarPerfil, lerConfiguracoes, lerPerfil, salvarPerfil } from './repositorios';

let banco: EvoluirDB;

beforeEach(() => {
  banco = new EvoluirDB(`teste-${Math.random().toString(36).slice(2)}`);
});

afterEach(async () => {
  await banco.delete();
});

describe('banco', () => {
  it('abre na versão 1 com as tabelas profile e settings', async () => {
    await banco.open();
    expect(banco.verno).toBe(1);
    expect(banco.tables.map((t) => t.name).sort()).toEqual(['profile', 'settings']);
  });
});

describe('perfil', () => {
  it('começa vazio', async () => {
    expect(await lerPerfil(banco)).toBeNull();
  });

  it('salva e lê um perfil só com os campos informados', async () => {
    const salvo = await salvarPerfil({ heightCm: 178.5 }, banco);
    expect(salvo.heightCm).toBe(178.5);
    expect(salvo.birthDate).toBeUndefined();
    expect((await lerPerfil(banco))?.heightCm).toBe(178.5);
  });

  it('aceita perfil totalmente vazio', async () => {
    const salvo = await salvarPerfil({}, banco);
    expect(salvo.id).toBe('main');
  });

  it('mantém createdAt e atualiza updatedAt ao salvar de novo', async () => {
    const primeiro = await salvarPerfil({ heightCm: 170 }, banco);
    await new Promise((r) => setTimeout(r, 5));
    const segundo = await salvarPerfil({ heightCm: 171 }, banco);
    expect(segundo.createdAt).toBe(primeiro.createdAt);
    expect(segundo.updatedAt >= primeiro.updatedAt).toBe(true);
    expect(segundo.heightCm).toBe(171);
  });

  it('rejeita dados inválidos sem gravar nada', async () => {
    await expect(salvarPerfil({ heightCm: 5 }, banco)).rejects.toThrow();
    expect(await lerPerfil(banco)).toBeNull();
  });

  it('rejeita campos desconhecidos', async () => {
    const comExtra = { heightCm: 170, cpf: '000' } as unknown as Parameters<typeof salvarPerfil>[0];
    await expect(salvarPerfil(comExtra, banco)).rejects.toThrow();
  });

  it('rejeita data de nascimento futura ou impossível', async () => {
    await expect(salvarPerfil({ birthDate: '2999-01-01' }, banco)).rejects.toThrow();
    await expect(salvarPerfil({ birthDate: '2020-02-31' }, banco)).rejects.toThrow();
  });

  it('apaga o perfil', async () => {
    await salvarPerfil({ heightCm: 170 }, banco);
    await apagarPerfil(banco);
    expect(await lerPerfil(banco)).toBeNull();
  });
});

describe('configurações', () => {
  it('cria valores padrão na primeira leitura e não os altera depois', async () => {
    const primeira = await lerConfiguracoes(banco);
    expect(primeira.lastBackupAt).toBeNull();
    expect(primeira.backupReminderDays).toBe(7);
    const segunda = await lerConfiguracoes(banco);
    expect(segunda.createdAt).toBe(primeira.createdAt);
  });
});

describe('descreverErroDeArmazenamento', () => {
  it('reconhece armazenamento cheio', () => {
    const erro = new Error('x');
    erro.name = 'QuotaExceededError';
    expect(descreverErroDeArmazenamento(erro)).toContain('cheio');
  });

  it('reconhece armazenamento indisponível', () => {
    const erro = new Error('x');
    erro.name = 'MissingAPIError';
    expect(descreverErroDeArmazenamento(erro)).toContain('navegação privada');
  });

  it('usa mensagem genérica para erros desconhecidos', () => {
    expect(descreverErroDeArmazenamento('qualquer coisa')).toContain('Não foi possível');
  });
});
