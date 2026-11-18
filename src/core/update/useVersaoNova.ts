import { useEffect, useState } from 'react';
import { buscarVersaoPublicada, existeVersaoNova } from './versao';

/** Verifica ao abrir, ao voltar para o app e ao recuperar a conexão se há versão nova publicada. */
export function useVersaoNova(buscar: typeof buscarVersaoPublicada = buscarVersaoPublicada): boolean {
  const [nova, setNova] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function verificar() {
      const publicada = await buscar();
      if (ativo && existeVersaoNova(__BUILD_TIME__, publicada)) setNova(true);
    }

    function aoVoltar() {
      if (document.visibilityState === 'visible') void verificar();
    }

    void verificar();
    document.addEventListener('visibilitychange', aoVoltar);
    window.addEventListener('online', aoVoltar);
    return () => {
      ativo = false;
      document.removeEventListener('visibilitychange', aoVoltar);
      window.removeEventListener('online', aoVoltar);
    };
  }, [buscar]);

  return nova;
}
