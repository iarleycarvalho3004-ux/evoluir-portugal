import { Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './Alerta.module.css';

type AlertaProps = { tone: 'info' | 'aviso' | 'critico'; title: string; children: ReactNode };

export function Alerta({ tone, title, children }: AlertaProps) {
  const Icone = tone === 'info' ? Info : TriangleAlert;
  return (
    <div className={`${styles.alerta} ${styles[tone]}`} role={tone === 'critico' ? 'alert' : 'status'}>
      <Icone size={20} aria-hidden="true" className={styles.icone} />
      <div>
        <p className={styles.titulo}>{title}</p>
        <p className={styles.texto}>{children}</p>
      </div>
    </div>
  );
}
