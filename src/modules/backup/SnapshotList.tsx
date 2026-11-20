import { History } from 'lucide-react';
import { useEffect, useState } from 'react';
import { entregarArquivo } from '../../core/backup/entrega';
import { nomeDoArquivo } from '../../core/backup/exportar';
import { excluirSnapshot, listarSnapshots } from '../../core/backup/snapshots';
import type { Snapshot, SnapshotReason } from '../../core/db/types';
import { formatarBytes } from '../../core/storage/armazenamento';
import { formatarData } from '../../core/utils/formatarData';
import { Button, FormSection } from '../../design';
import styles from './SnapshotList.module.css';

const MOTIVO: Record<SnapshotReason, string> = {
  'before-restore': 'Antes de restaurar um backup',
  'before-undo': 'Antes de desfazer uma restauração',
};

type Props = { versao: number; aoRestaurar: (snapshot: Snapshot) => void; aoMudar: () => void };

export function SnapshotList({ versao, aoRestaurar, aoMudar }: Props) {
  const [itens, setItens] = useState<Snapshot[] | null>(null);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    listarSnapshots()
      .then((lista) => {
        if (ativo) setItens(lista);
      })
      .catch(() => {
        if (ativo) setItens([]);
      });
    return () => {
      ativo = false;
    };
  }, [versao]);

  async function salvar(snapshot: Snapshot) {
    try {
      const resultado = await entregarArquivo(nomeDoArquivo(new Date(snapshot.createdAt), 'evoluir-portugal-copia'), snapshot.payload);
      setMensagem(resultado === 'cancelado' ? 'Cancelado. A cópia continua guardada no app.' : 'Cópia entregue.');
    } catch {
      setMensagem('Não foi possível salvar a cópia agora.');
    }
  }

  async function excluir(id: string) {
    try {
      await excluirSnapshot(id);
      setConfirmando(null);
      setItens((atual) => (atual ? atual.filter((s) => s.id !== id) : atual));
      aoMudar();
    } catch {
      setMensagem('Não foi possível excluir a cópia.');
    }
  }

  return (
    <FormSection icon={History} title="Cópias de segurança" subtitle="Criadas automaticamente antes de cada restauração">
      {itens === null ? <p className={styles.texto}>Carregando…</p> : null}
      {itens && itens.length === 0 ? (
        <p className={styles.texto}>Nenhuma cópia ainda. Elas aparecem aqui depois da primeira restauração.</p>
      ) : null}
      {itens && itens.length > 0 ? (
        <ul className={styles.lista}>
          {itens.map((snapshot) => (
            <li key={snapshot.id} className={styles.item}>
              <p className={styles.titulo}>{formatarData(snapshot.createdAt)}</p>
              <p className={styles.detalhe}>
                {MOTIVO[snapshot.reason]} · {snapshot.recordCounts.profile ?? 0} perfil, {snapshot.recordCounts.settings ?? 0} configurações ·{' '}
                {formatarBytes(snapshot.payload.length)}
              </p>
              {confirmando === snapshot.id ? (
                <div className={styles.acoes}>
                  <Button variant="perigo" onClick={() => void excluir(snapshot.id)}>
                    Confirmar exclusão
                  </Button>
                  <Button variant="secundario" onClick={() => setConfirmando(null)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className={styles.acoes}>
                  <Button variant="secundario" onClick={() => aoRestaurar(snapshot)}>
                    Restaurar esta cópia
                  </Button>
                  <Button variant="secundario" onClick={() => void salvar(snapshot)}>
                    Salvar em Arquivos
                  </Button>
                  <Button variant="secundario" onClick={() => setConfirmando(snapshot.id)}>
                    Excluir
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : null}
      {mensagem ? (
        <p className={styles.texto} role="status">
          {mensagem}
        </p>
      ) : null}
    </FormSection>
  );
}
