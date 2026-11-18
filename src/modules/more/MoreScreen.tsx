import { ListChecks, Settings, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, ScreenHeader } from '../../design';
import { formatarData } from '../../core/utils/formatarData';
import { InstallGuide } from './InstallGuide';
import styles from './MoreScreen.module.css';

type Recurso = { nome: string; descricao: string; versao: string; icon: LucideIcon };

const recursos: Recurso[] = [
  { nome: 'Hábitos', descricao: 'Água, sono e checklist diário', versao: 'V4.0', icon: ListChecks },
  { nome: 'Assistente', descricao: 'Orientações com inteligência artificial', versao: 'V6.0', icon: Sparkles },
  { nome: 'Configurações', descricao: 'Perfil, armazenamento e backup', versao: 'V0.4 e V0.5', icon: Settings },
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
          {recursos.map(({ nome, descricao, versao, icon: Icon }) => (
            <li key={nome} className={styles.linha}>
              <Icon size={22} aria-hidden="true" />
              <div className={styles.texto}>
                <p className={styles.nome}>{nome}</p>
                <p className={styles.descricao}>{descricao}</p>
                <p className={styles.planejado}>Iarley vai desenvolver na {versao}</p>
              </div>
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
