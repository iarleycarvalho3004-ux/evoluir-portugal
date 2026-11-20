import { useCallback, useSyncExternalStore } from 'react';

type EventoInstalacao = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let guardado: EventoInstalacao | null = null;
let iniciado = false;
const ouvintes = new Set<() => void>();

function avisar() {
  ouvintes.forEach((ouvinte) => ouvinte());
}

/**
 * Captura o aviso de instalação do navegador (Chrome no Android). Precisa rodar na abertura do app,
 * porque o aviso costuma chegar antes de a tela de instalação existir.
 */
export function iniciarCapturaDeInstalacao(): void {
  if (iniciado) return;
  iniciado = true;
  window.addEventListener('beforeinstallprompt', (evento) => {
    evento.preventDefault();
    guardado = evento as EventoInstalacao;
    avisar();
  });
  window.addEventListener('appinstalled', () => {
    guardado = null;
    avisar();
  });
}

const assinar = (ouvinte: () => void) => {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
};

export type ResultadoInstalacao = 'accepted' | 'dismissed' | 'indisponivel';

export function usePromptInstalacao(): { disponivel: boolean; instalar: () => Promise<ResultadoInstalacao> } {
  const evento = useSyncExternalStore(assinar, () => guardado, () => null);
  const instalar = useCallback(async (): Promise<ResultadoInstalacao> => {
    if (!evento) return 'indisponivel';
    await evento.prompt();
    const escolha = await evento.userChoice;
    guardado = null;
    avisar();
    return escolha.outcome;
  }, [evento]);
  return { disponivel: evento !== null, instalar };
}
