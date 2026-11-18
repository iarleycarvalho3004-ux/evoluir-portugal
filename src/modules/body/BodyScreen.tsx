import { TrendingUp } from 'lucide-react';
import { EmptyState, ScreenHeader } from '../../design';

export function BodyScreen() {
  return (
    <>
      <ScreenHeader title="Evolução" subtitle="Peso, medidas e fotos" />
      <EmptyState
        icon={TrendingUp}
        title="Acompanhe sua evolução"
        description="Histórico de peso, medidas e fotos privadas aparecem aqui quando o módulo for liberado."
        availableIn="Etapa 5"
      />
    </>
  );
}
