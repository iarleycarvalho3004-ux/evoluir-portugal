import { SearchX } from 'lucide-react';
import { Button, EmptyState, ScreenHeader } from '../design';

export function NotFoundScreen() {
  return (
    <>
      <ScreenHeader title="Página não encontrada" />
      <EmptyState
        icon={SearchX}
        title="Esse endereço não existe"
        description="Volte ao início e use a navegação inferior para acessar as telas do app."
      />
      <div style={{ marginTop: 'var(--esp-4)' }}>
        <Button to="/">Voltar ao início</Button>
      </div>
    </>
  );
}
