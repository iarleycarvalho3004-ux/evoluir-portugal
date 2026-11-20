import Dexie from 'dexie';
import type { EntityTable } from 'dexie';
import type { Profile, Settings, Snapshot } from './types';

/**
 * Banco local (IndexedDB). Regras de evolução do schema:
 *  - cada mudança vira uma nova `this.version(n)` com `upgrade` quando precisar transformar dados;
 *  - nenhuma migração apaga dados do usuário;
 *  - as tabelas de cada módulo entram na etapa em que o módulo é desenvolvido.
 */
export class EvoluirDB extends Dexie {
  declare profile: EntityTable<Profile, 'id'>;
  declare settings: EntityTable<Settings, 'id'>;
  declare snapshots: EntityTable<Snapshot, 'id'>;

  constructor(nome = 'evoluir-portugal') {
    super(nome);
    this.version(1).stores({
      profile: 'id',
      settings: 'id',
    });
    // v2 (2E): cópias de segurança automáticas. Não altera nem apaga dados existentes.
    this.version(2).stores({
      snapshots: 'id, createdAt',
    });
  }
}

let instancia: EvoluirDB | undefined;

/** Banco padrão do app, criado só quando é usado pela primeira vez. */
export function obterBanco(): EvoluirDB {
  instancia ??= new EvoluirDB();
  return instancia;
}
