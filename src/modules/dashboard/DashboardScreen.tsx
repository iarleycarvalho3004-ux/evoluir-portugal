import { LayoutDashboard } from 'lucide-react';
import { EmptyState, ScreenHeader, Stat } from '../../design';
import styles from './DashboardScreen.module.css';

export function DashboardScreen() {
  return (
    <>
      <ScreenHeader title="Início" subtitle="Seu resumo do dia" />
      <div className={styles.indicadores}>
        <Stat label="Peso atual" value={null} />
        <Stat label="Próximo treino" value={null} />
      </div>
      <EmptyState
        icon={LayoutDashboard}
        title="Seu painel começa vazio"
        description="Ele reúne peso, treino e alimentação e se preenche conforme os módulos forem liberados."
        availableIn="Etapa 7"
      />
    </>
  );
}
