import { describe, expect, it } from 'vitest';
import { jsonCanonico } from './canonico';
import type { DadosBackup } from './formato';
import { LIMITE_BYTES } from './formato';
import { sha256Hex } from './hash';
import { validarBackup, verificarDuplicatas, verificarIntegridade } from './validacao';

const AGORA = '2026-11-18T12:00:00.000Z';

const dadosValidos: DadosBackup = {
  profile: [{ id: 'main', heightCm: 178, goal: 'hypertrophy', createdAt: AGORA, updatedAt: AGORA }],
  settings: [{ id: 'main', lastBackupAt: null, backupReminderDays: 7, createdAt: AGORA, updatedAt: AGORA }],
};

async function montar(data: unknown = dadosValidos, extra: Record<string, unknown> = {}): Promise<string> {
  return JSON.stringify({
    app: 'evoluir-portugal',
    formatVersion: 1,
    schemaVersion: 1,
    exportedAt: AGORA,
    appVersion: '0.5.0',
    includesPhotos: false,
    data,
    checksum: await sha256Hex(jsonCanonico(data)),
    ...extra,
  });
}

async function codigoDoErro(texto: string, tamanho?: number) {
  const resultado = await validarBackup(texto, tamanho);
  return resultado.ok ? 'ok' : resultado.erro.codigo;
}

describe('validarBackup', () => {
  it('aceita um backup válido', async () => {
    expect(await codigoDoErro(await montar())).toBe('ok');
  });

  it('recusa arquivo grande demais, vazio ou que não é JSON', async () => {
    expect(await codigoDoErro('{}', LIMITE_BYTES + 1)).toBe('grande-demais');
    expect(await codigoDoErro('   ')).toBe('vazio');
    expect(await codigoDoErro('isto não é json')).toBe('json-invalido');
  });

  it('recusa estrutura profunda demais', async () => {
    expect(await codigoDoErro('['.repeat(40) + ']'.repeat(40))).toBe('profundo-demais');
  });

  it('recusa JSON que não é um backup do app', async () => {
    expect(await codigoDoErro('[1,2,3]')).toBe('nao-e-backup');
    expect(await codigoDoErro('{"app":"outro"}')).toBe('nao-e-backup');
  });

  it('recusa backup de versão mais nova', async () => {
    expect(await codigoDoErro(await montar(dadosValidos, { schemaVersion: 99 }))).toBe('versao-mais-nova');
    expect(await codigoDoErro(await montar(dadosValidos, { formatVersion: 2 }))).toBe('versao-mais-nova');
  });

  it('recusa backup com fotos (ainda não suportado)', async () => {
    expect(await codigoDoErro(await montar(dadosValidos, { includesPhotos: true }))).toBe('tem-fotos');
  });

  it('recusa campos desconhecidos e valores inválidos', async () => {
    expect(await codigoDoErro(await montar(dadosValidos, { extra: 1 }))).toBe('formato-invalido');
    const alturaAbsurda = { ...dadosValidos, profile: [{ ...dadosValidos.profile[0], heightCm: 5 }] };
    expect(await codigoDoErro(await montar(alturaAbsurda))).toBe('formato-invalido');
    const campoExtra = { ...dadosValidos, profile: [{ ...dadosValidos.profile[0], cpf: '1' }] };
    expect(await codigoDoErro(await montar(campoExtra))).toBe('formato-invalido');
  });

  it('recusa tabelas com registros demais', async () => {
    const demais = { ...dadosValidos, profile: [dadosValidos.profile[0], dadosValidos.profile[0]] };
    expect(await codigoDoErro(await montar(demais))).toBe('formato-invalido');
  });

  it('detecta adulteração pelo checksum', async () => {
    const adulterado = { ...dadosValidos, profile: [{ ...dadosValidos.profile[0], heightCm: 190 }] };
    const texto = await montar(dadosValidos, { data: adulterado });
    expect(await codigoDoErro(texto)).toBe('checksum');
  });

  it('recusa checksum com formato inválido', async () => {
    expect(await codigoDoErro(await montar(dadosValidos, { checksum: 'abc' }))).toBe('formato-invalido');
  });
});

describe('verificarDuplicatas', () => {
  it('encontra ids repetidos', () => {
    expect(verificarDuplicatas({ itens: [{ id: 'a' }, { id: 'b' }] })).toBeNull();
    expect(verificarDuplicatas({ itens: [{ id: 'a' }, { id: 'a' }] })).toContain('itens');
  });
});

describe('verificarIntegridade', () => {
  const relacoes = [{ tabela: 'series', campo: 'sessaoId', referencia: 'sessoes' }];

  it('aceita referências existentes', () => {
    expect(verificarIntegridade({ sessoes: [{ id: 's1' }], series: [{ id: 'x', sessaoId: 's1' }] }, relacoes)).toBeNull();
  });

  it('recusa registros órfãos', () => {
    expect(verificarIntegridade({ sessoes: [{ id: 's1' }], series: [{ id: 'x', sessaoId: 's2' }] }, relacoes)).toContain('series');
  });

  it('ignora campos vazios', () => {
    expect(verificarIntegridade({ sessoes: [], series: [{ id: 'x' }] }, relacoes)).toBeNull();
  });
});
