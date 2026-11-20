import { LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStatusBackup } from '../../core/backup/useStatusBackup';
import { Alerta, EmptyState, ScreenHeader, Stat } from '../../design';
import styles from './DashboardScreen.module.css';

export function DashboardScreen() {
  const { aviso, temDados } = useStatusBackup();
  const precisaDeBackup = temDados && aviso !== null && aviso.tipo !== 'em-dia';
  return (
    <>
      <ScreenHeader title="Início" subtitle="Seu resumo do dia" />
      {precisaDeBackup && aviso ? (
        <div className={styles.aviso}>
          <Alerta tone="aviso" title={aviso.tipo === 'nunca' ? 'Faça seu primeiro backup' : 'Backup desatualizado'}>
            {aviso.tipo === 'desatualizado' ? `O último backup foi há ${aviso.dias} dias.` : 'Seus dados existem só neste aparelho.'}{' '}
            <Link to="/mais/backup" className={styles.link}>
              Abrir backup
            </Link>
          </Alerta>
        </div>
      ) : null}
      <div className={styles.indicadores}>
        <Stat label="Peso atual" value={null} />
        <Stat label="Próximo treino" value={null} />
      </div>
      <EmptyState
        icon={LayoutDashboard}
        title="Seu painel começa vazio"
        description="Ele reúne peso, treino e alimentação e se preenche conforme os módulos forem liberados."
        availableIn="V5.0"
      />
    </>
  );
}
