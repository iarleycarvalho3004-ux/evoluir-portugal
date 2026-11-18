import { useEffect, useState } from 'react';
import { lerConfiguracoes } from '../../core/db/repositorios';
import type { Settings } from '../../core/db/types';
import { detectarInstalacao, lerAmbiente } from '../../core/pwa/instalacao';
import { formatarBytes } from '../../core/storage/armazenamento';
import type { EstadoPersistencia } from '../../core/storage/armazenamento';
import { avaliarBackup } from '../../core/storage/avisoBackup';
import { useArmazenamento } from '../../core/storage/useArmazenamento';
import { Alerta, Card, ProgressBar } from '../../design';
import styles from './StorageSection.module.css';

const TEXTO_PERSISTENCIA: Record<EstadoPersistencia, { titulo: string; texto: string }> = {
  concedida: {
    titulo: 'Concedido',
    texto: 'O iPhone marcou os dados como persistentes. Ainda assim, isso não é uma garantia.',
  },
  'nao-concedida': {
    titulo: 'Não concedido',
    texto: 'O iPhone não concedeu proteção extra. Isso é comum e não impede o uso, mas torna o backup ainda mais importante.',
  },
  indisponivel: {
    titulo: 'Indisponível',
    texto: 'Este navegador não informa o estado do armazenamento persistente.',
  },
};

function BlocoBackup({ configuracoes }: { configuracoes: Settings | 'erro' | null }) {
  if (configuracoes === null) return null;
  if (configuracoes === 'erro') {
    return (
      <Alerta tone="aviso" title="Backup não verificado">
        Não foi possível ler as configurações deste aparelho.
      </Alerta>
    );
  }
  const aviso = avaliarBackup(configuracoes.lastBackupAt, new Date(), configuracoes.backupReminderDays);
  if (aviso.tipo === 'nunca') {
    return (
      <Alerta tone="aviso" title="Você ainda não fez backup">
        A exportação será desenvolvida na V0.5. Até lá, seus dados existem só neste aparelho.
      </Alerta>
    );
  }
  if (aviso.tipo === 'desatualizado') {
    return (
      <Alerta tone="aviso" title="Backup desatualizado">
        O último backup foi há {aviso.dias} dias.
      </Alerta>
    );
  }
  return (
    <Alerta tone="info" title="Backup em dia">
      O último backup foi há {aviso.dias} {aviso.dias === 1 ? 'dia' : 'dias'}.
    </Alerta>
  );
}

export function StorageSection() {
  const { carregando, persistencia, espaco } = useArmazenamento();
  const [configuracoes, setConfiguracoes] = useState<Settings | 'erro' | null>(null);
  const instalacao = detectarInstalacao(lerAmbiente());

  useEffect(() => {
    let ativo = true;
    lerConfiguracoes()
      .then((c) => ativo && setConfiguracoes(c))
      .catch(() => ativo && setConfiguracoes('erro'));
    return () => {
      ativo = false;
    };
  }, []);

  const textoPersistencia = TEXTO_PERSISTENCIA[persistencia];
  const porcentagem = espaco ? Math.round(espaco.fracao * 100) : 0;

  return (
    <Card>
      <h2 className={styles.titulo}>Armazenamento</h2>
      <div className={styles.blocos}>
        {instalacao === 'ios-safari' || instalacao === 'ios-outro' ? (
          <Alerta tone="aviso" title="Você não está usando o app instalado">
            No navegador, o iOS pode apagar os dados de um site que fique cerca de 7 dias sem uso. O app instalado na Tela
            de Início não segue essa regra. Instale antes de registrar dados (veja o guia em Mais).
          </Alerta>
        ) : null}

        <div>
          <p className={styles.rotulo}>Armazenamento persistente</p>
          <p className={styles.valor}>{carregando ? 'Verificando…' : textoPersistencia.titulo}</p>
          {carregando ? null : <p className={styles.nota}>{textoPersistencia.texto}</p>}
        </div>

        <div>
          <p className={styles.rotulo}>Espaço usado</p>
          {carregando ? (
            <p className={styles.valor}>Verificando…</p>
          ) : espaco ? (
            <>
              <ProgressBar value={porcentagem} label="Espaço usado" tone={espaco.nivel === 'ok' ? 'normal' : 'alerta'} />
              <p className={styles.valor}>
                {formatarBytes(espaco.usado)} de {formatarBytes(espaco.quota)} ({porcentagem < 1 ? 'menos de 1' : porcentagem}%)
              </p>
              <p className={styles.nota}>Estimativa aproximada feita pelo navegador. No iOS, os números podem ser imprecisos.</p>
            </>
          ) : (
            <p className={styles.nota}>Este navegador não informa o espaço usado.</p>
          )}
        </div>

        {espaco?.nivel === 'aviso' ? (
          <Alerta tone="aviso" title="Espaço ficando cheio">
            Mais de 70% do espaço disponível está em uso. Faça backup e evite guardar arquivos desnecessários.
          </Alerta>
        ) : null}
        {espaco?.nivel === 'critico' ? (
          <Alerta tone="critico" title="Espaço quase esgotado">
            Mais de 90% do espaço disponível está em uso. Novos registros podem falhar. Faça backup agora.
          </Alerta>
        ) : null}

        <BlocoBackup configuracoes={configuracoes} />

        <p className={styles.nota}>
          Nada disso substitui o backup. O armazenamento do iPhone nunca deve ser tratado como permanente.
        </p>
      </div>
    </Card>
  );
}
