import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { lerConfiguracoes } from '../../core/db/repositorios';
import type { Settings } from '../../core/db/types';
import { detectarInstalacao, detectarSistema, lerAmbiente } from '../../core/pwa/instalacao';
import { formatarBytes } from '../../core/storage/armazenamento';
import type { EstadoPersistencia } from '../../core/storage/armazenamento';
import { avaliarBackup } from '../../core/storage/avisoBackup';
import { useArmazenamento } from '../../core/storage/useArmazenamento';
import { Alerta, FormSection, ProgressBar } from '../../design';
import styles from './StorageSection.module.css';

type Tom = 'ok' | 'atencao' | 'neutro';

type LinhaProps = { tom: Tom; titulo: string; valor: string; nota?: string; children?: ReactNode };

function Linha({ tom, titulo, valor, nota, children }: LinhaProps) {
  return (
    <div className={styles.linha}>
      <span className={`${styles.ponto} ${styles[tom]}`} aria-hidden="true" />
      <div className={styles.conteudo}>
        <p className={styles.titulo}>{titulo}</p>
        <p className={styles.valor}>{valor}</p>
        {children}
        {nota ? <p className={styles.nota}>{nota}</p> : null}
      </div>
    </div>
  );
}

const PERSISTENCIA: Record<EstadoPersistencia, { tom: Tom; valor: string; nota: string }> = {
  concedida: {
    tom: 'ok',
    valor: 'Concedido',
    nota: 'O iPhone marcou os dados como persistentes. Ainda assim, isso não é uma garantia.',
  },
  'nao-concedida': {
    tom: 'atencao',
    valor: 'Não concedido',
    nota: 'Isso é comum e não impede o uso, mas torna o backup ainda mais importante.',
  },
  indisponivel: {
    tom: 'neutro',
    valor: 'Indisponível',
    nota: 'Este navegador não informa o estado do armazenamento persistente.',
  },
};

function linhaDeBackup(configuracoes: Settings | 'erro' | null): Omit<LinhaProps, 'children'> {
  const titulo = 'Backup';
  if (configuracoes === null) return { tom: 'neutro', titulo, valor: 'Verificando…' };
  if (configuracoes === 'erro') {
    return { tom: 'neutro', titulo, valor: 'Não verificado', nota: 'Não foi possível ler as configurações deste aparelho.' };
  }
  const aviso = avaliarBackup(configuracoes.lastBackupAt, new Date(), configuracoes.backupReminderDays);
  if (aviso.tipo === 'nunca') {
    return {
      tom: 'atencao',
      titulo,
      valor: 'Nunca feito',
      nota: 'Seus dados existem só neste aparelho. Faça um backup para protegê-los.',
    };
  }
  if (aviso.tipo === 'desatualizado') {
    return { tom: 'atencao', titulo, valor: 'Desatualizado', nota: `O último backup foi há ${aviso.dias} dias.` };
  }
  return {
    tom: 'ok',
    titulo,
    valor: 'Em dia',
    nota: `O último backup foi há ${aviso.dias} ${aviso.dias === 1 ? 'dia' : 'dias'}.`,
  };
}

export function StorageSection() {
  const { carregando, persistencia, espaco } = useArmazenamento();
  const [configuracoes, setConfiguracoes] = useState<Settings | 'erro' | null>(null);
  const ambiente = lerAmbiente();
  const instalacao = detectarInstalacao(ambiente);
  const sistema = detectarSistema(ambiente);

  useEffect(() => {
    let ativo = true;
    lerConfiguracoes()
      .then((c) => {
        if (ativo) setConfiguracoes(c);
      })
      .catch(() => {
        if (ativo) setConfiguracoes('erro');
      });
    return () => {
      ativo = false;
    };
  }, []);

  const porcentagem = espaco ? Math.round(espaco.fracao * 100) : 0;
  const dadosPersistencia = PERSISTENCIA[persistencia];

  return (
    <FormSection icon={ShieldCheck} title="Seus dados" subtitle="Tudo fica só neste aparelho">
      {instalacao !== 'instalado' && sistema === 'android' ? (
        <Alerta tone="info" title="Instalar o app ajuda">
          Instalar o app na tela inicial aumenta as chances de o navegador manter seus dados. Veja o guia em Mais.
        </Alerta>
      ) : null}
      {instalacao === 'ios-safari' || instalacao === 'ios-outro' ? (
        <Alerta tone="aviso" title="Você não está usando o app instalado">
          No navegador, o iOS pode apagar os dados de um site que fique cerca de 7 dias sem uso. O app instalado na Tela de
          Início não segue essa regra. Instale antes de registrar dados (veja o guia em Mais).
        </Alerta>
      ) : null}

      <div className={styles.linhas}>
        {carregando ? (
          <Linha tom="neutro" titulo="Armazenamento persistente" valor="Verificando…" />
        ) : (
          <Linha tom={dadosPersistencia.tom} titulo="Armazenamento persistente" valor={dadosPersistencia.valor} nota={dadosPersistencia.nota} />
        )}

        {carregando ? (
          <Linha tom="neutro" titulo="Espaço usado" valor="Verificando…" />
        ) : espaco ? (
          <Linha
            tom={espaco.nivel === 'ok' ? 'ok' : 'atencao'}
            titulo="Espaço usado"
            valor={`${formatarBytes(espaco.usado)} de ${formatarBytes(espaco.quota)} (${porcentagem < 1 ? 'menos de 1' : porcentagem}%)`}
            nota="Estimativa aproximada feita pelo navegador. No iOS, os números podem ser imprecisos."
          >
            <ProgressBar value={porcentagem} label="Espaço usado" tone={espaco.nivel === 'ok' ? 'normal' : 'alerta'} />
          </Linha>
        ) : (
          <Linha tom="neutro" titulo="Espaço usado" valor="Indisponível" nota="Este navegador não informa o espaço usado." />
        )}

        <Linha {...linhaDeBackup(configuracoes)}>
          <Link to="/mais/backup" className={styles.link}>
            Abrir backup e restauração
          </Link>
        </Linha>
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

      <p className={styles.rodape}>Nada disso substitui o backup. O armazenamento do iPhone nunca deve ser tratado como permanente.</p>
    </FormSection>
  );
}
