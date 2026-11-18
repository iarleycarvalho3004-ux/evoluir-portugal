import { useEffect, useState } from 'react';
import { estimarEspaco, solicitarPersistencia } from './armazenamento';
import type { Espaco, EstadoPersistencia } from './armazenamento';

type Estado = { carregando: boolean; persistencia: EstadoPersistencia; espaco: Espaco | null };

export function useArmazenamento(): Estado {
  const [estado, setEstado] = useState<Estado>({ carregando: true, persistencia: 'indisponivel', espaco: null });

  useEffect(() => {
    let ativo = true;
    void (async () => {
      const persistencia = await solicitarPersistencia();
      const espaco = await estimarEspaco();
      if (ativo) setEstado({ carregando: false, persistencia, espaco });
    })();
    return () => {
      ativo = false;
    };
  }, []);

  return estado;
}
