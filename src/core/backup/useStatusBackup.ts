import { useEffect, useState } from 'react';
import { lerConfiguracoesExistentes, lerPerfil } from '../db/repositorios';
import { avaliarBackup } from '../storage/avisoBackup';
import type { AvisoBackup } from '../storage/avisoBackup';

export type StatusBackup = { carregado: boolean; aviso: AvisoBackup | null; temDados: boolean };

/** Lê, sem gravar nada, se existem dados a proteger e como está o backup. Falhas de leitura ficam em silêncio. */
export function useStatusBackup(): StatusBackup {
  const [estado, setEstado] = useState<StatusBackup>({ carregado: false, aviso: null, temDados: false });

  useEffect(() => {
    let ativo = true;
    void (async () => {
      try {
        const [perfil, configuracoes] = await Promise.all([lerPerfil(), lerConfiguracoesExistentes()]);
        const aviso = avaliarBackup(configuracoes?.lastBackupAt ?? null, new Date(), configuracoes?.backupReminderDays ?? 7);
        if (ativo) setEstado({ carregado: true, aviso, temDados: perfil !== null });
      } catch {
        if (ativo) setEstado({ carregado: true, aviso: null, temDados: false });
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  return estado;
}
