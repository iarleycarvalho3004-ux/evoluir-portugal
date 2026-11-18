import type { LucideIcon } from 'lucide-react';
import { Card } from './Card';
import styles from './EmptyState.module.css';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Versão em que a função será desenvolvida, por exemplo "V1.0". */
  availableIn?: string;
};

export function EmptyState({ icon: Icon, title, description, availableIn }: EmptyStateProps) {
  return (
    <Card>
      <div className={styles.icone}>
        <Icon size={24} aria-hidden="true" />
      </div>
      <h2 className={styles.titulo}>{title}</h2>
      <p className={styles.descricao}>{description}</p>
      {availableIn ? <span className={styles.etapa}>Iarley vai desenvolver na {availableIn}</span> : null}
    </Card>
  );
}
