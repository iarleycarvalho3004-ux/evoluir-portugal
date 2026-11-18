import { ListChecks, Settings, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, ScreenHeader } from '../../design';
import { formatarData } from '../../core/utils/formatarData';
import styles from './MoreScreen.module.css';

type Recurso = { nome: string; descricao: string; etapa: string; icon: LucideIcon };

const recursos: Recurso[] = [
  { nome: 'Hábitos', descricao: 'Água, sono e checklist diário', etapa: 'Etapa 6', icon: ListChecks },
  { nome: 'Assistente', descricao: 'Orientações com inteligência artificial', etapa: 'Etapa 8', icon: Sparkles },
  { nome: 'Configurações', descricao: 'Perfil, armazenamento e backup', etapa: 'Etapas 2D e 2E', icon: Settings },
];

export function MoreScreen() {
  return (
    <>
      <ScreenHeader title="Mais" subtitle="Outros recursos do app" />
      <Card>
        <ul className={styles.lista}>
          {recursos.map(({ nome, descricao, etapa, icon: Icon }) => (
            <li key={nome} className={styles.linha}>
              <Icon size={22} aria-hidden="true" />
              <div className={styles.texto}>
                <p className={styles.nome}>{nome}</p>
                <p className={styles.descricao}>{descricao}</p>
              </div>
              <span className={styles.etapa}>{etapa}</span>
            </li>
          ))}
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
