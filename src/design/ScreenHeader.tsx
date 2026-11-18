import { FlagBar } from './FlagBar';
import styles from './ScreenHeader.module.css';

type ScreenHeaderProps = { title: string; subtitle?: string };

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <header className={styles.cabecalho}>
      <FlagBar />
      <h1 className={styles.titulo}>{title}</h1>
      {subtitle ? <p className={styles.subtitulo}>{subtitle}</p> : null}
    </header>
  );
}
