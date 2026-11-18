import { Apple } from 'lucide-react';
import { EmptyState, ScreenHeader } from '../../design';

export function NutritionScreen() {
  return (
    <>
      <ScreenHeader title="Nutrição" subtitle="Suas refeições e macros" />
      <EmptyState
        icon={Apple}
        title="Planeje suas refeições"
        description="Plano alimentar, registro diário e lista de compras aparecem aqui quando o módulo for liberado."
        availableIn="Etapa 4"
      />
    </>
  );
}
