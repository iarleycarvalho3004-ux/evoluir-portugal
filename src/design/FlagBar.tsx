import styles from './FlagBar.module.css';

type FlagBarProps = { size?: 'sm' | 'md' };

/** Faixa nas proporções da bandeira (verde 2/5, vermelho 3/5). Assinatura visual do app. */
export function FlagBar({ size = 'md' }: FlagBarProps) {
  const tamanho = size === 'sm' ? styles.pequena : styles.media;
  return (
    <span className={`${styles.faixa} ${tamanho}`} aria-hidden="true">
      <span className={styles.verde} />
      <span className={styles.vermelha} />
    </span>
  );
}
