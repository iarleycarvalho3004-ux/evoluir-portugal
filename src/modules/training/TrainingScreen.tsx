import { Dumbbell } from 'lucide-react';
import { EmptyState, ScreenHeader } from '../../design';

export function TrainingScreen() {
  return (
    <>
      <ScreenHeader title="Treino" subtitle="Sua divisão semanal" />
      <EmptyState
        icon={Dumbbell}
        title="Monte sua divisão semanal"
        description="Seus dias de treino, exercícios e cargas aparecem aqui quando o módulo for liberado."
        availableIn="Etapa 3"
      />
    </>
  );
}
