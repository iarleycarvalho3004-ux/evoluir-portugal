import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from './Card';
import styles from './FormSection.module.css';

type FormSectionProps = { icon: LucideIcon; title: string; subtitle?: string; children?: ReactNode };

export function FormSection({ icon: Icon, title, subtitle, children }: FormSectionProps) {
  return (
    <Card>
      <div className={children ? `${styles.cabecalho} ${styles.comCorpo}` : styles.cabecalho}>
        <span className={styles.icone}>
          <Icon size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 className={styles.titulo}>{title}</h2>
          {subtitle ? <p className={styles.subtitulo}>{subtitle}</p> : null}
        </div>
      </div>
      {children ? <div className={styles.corpo}>{children}</div> : null}
    </Card>
  );
}
