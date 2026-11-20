import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Snapshot } from '../../core/db/types';
import { formatarData } from '../../core/utils/formatarData';
import { Alerta, ScreenHeader } from '../../design';
import { ExportSection } from './ExportSection';
import { RestoreFlow } from './RestoreFlow';
import type { EntradaDeRestauracao } from './RestoreFlow';
import { SnapshotList } from './SnapshotList';
import styles from './BackupScreen.module.css';

export function BackupScreen() {
  const [versao, setVersao] = useState(0);
  const [entrada, setEntrada] = useState<EntradaDeRestauracao | null>(null);
  const atualizar = () => setVersao((n) => n + 1);

  function restaurarCopia(snapshot: Snapshot) {
    setEntrada({
      id: Date.now(),
      nome: `cópia de segurança de ${formatarData(snapshot.createdAt)}`,
      texto: snapshot.payload,
      modo: 'substituir',
    });
  }

  return (
    <>
      <Link to="/mais" className={styles.voltar} aria-label="Voltar para Mais">
        <ChevronLeft size={20} aria-hidden="true" />
        Mais
      </Link>
      <ScreenHeader title="Backup" subtitle="Exporte, restaure e proteja seus dados" />
      <div className={styles.secoes}>
        <Alerta tone="info" title="O backup é a sua proteção real">
          O armazenamento do iPhone nunca é garantido. Guarde o arquivo em Arquivos ou no iCloud Drive, fora do app.
        </Alerta>
        <ExportSection aoMudar={atualizar} />
        <RestoreFlow entrada={entrada} aoMudar={atualizar} />
        <SnapshotList versao={versao} aoRestaurar={restaurarCopia} aoMudar={atualizar} />
      </div>
    </>
  );
}
