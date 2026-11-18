import { ChevronRight, ListChecks, Settings, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, ScreenHeader } from '../../design';
import { formatarData } from '../../core/utils/formatarData';
import { InstallGuide } from './InstallGuide';
import styles from './MoreScreen.module.css';

type Recurso = { nome: string; descricao: string; planejado: string; icon: LucideIcon; to?: string };

const recursos: Recurso[] = [
  { nome: 'Hábitos', descricao: 'Água, sono e checklist diário', planejado: 'Iarley vai desenvolver na V4.0', icon: ListChecks },
  { nome: 'Assistente', descricao: 'Orientações com inteligência artificial', planejado: 'Iarley vai desenvolver na V6.0', icon: Sparkles },
  {
    nome: 'Configurações',
    descricao: 'Perfil e armazenamento',
    planejado: 'Backup e restauração: Iarley vai desenvolver na V0.5',
    icon: Settings,
    to: '/mais/configuracoes',
  },
];

export function MoreScreen() {
  return (
    <>
      <ScreenHeader title="Mais" subtitle="Outros recursos do app" />
      <div className={styles.bloco}>
        <InstallGuide />
      </div>
      <Card>
        <ul className={styles.lista}>
          {recursos.map(({ nome, descricao, planejado, icon: Icon, to }) => {
            const conteudo = (
              <>
                <Icon size={22} aria-hidden="true" />
                <div className={styles.texto}>
                  <p className={styles.nome}>{nome}</p>
                  <p className={styles.descricao}>{descricao}</p>
                  <p className={styles.planejado}>{planejado}</p>
                </div>
                {to ? <ChevronRight size={20} aria-hidden="true" /> : null}
              </>
            );
            return (
              <li key={nome} className={styles.linha}>
                {to ? (
                  <Link to={to} className={styles.link}>
                    {conteudo}
                  </Link>
                ) : (
                  conteudo
                )}
              </li>
            );
          })}
        </ul>
      </Card>
      <dl className={styles.versao}>
        <dt>Versão</dt>
        <dd>{__APP_VERSION__}</dd>
        <dt>Gerado em</dt>
        <dd>{formatarData(__BUILD_TIME__)}</dd>
      </dl>
    </>
  );
}
