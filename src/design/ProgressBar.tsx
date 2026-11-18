import styles from './ProgressBar.module.css';

type ProgressBarProps = { value: number; max?: number; label: string; tone?: 'normal' | 'alerta' };

export function ProgressBar({ value, max = 100, label, tone = 'normal' }: ProgressBarProps) {
  const limite = max > 0 ? max : 100;
  const atual = Number.isFinite(value) ? Math.min(Math.max(value, 0), limite) : 0;
  const porcentagem = (atual / limite) * 100;
  return (
    <div
      className={styles.trilho}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={limite}
      aria-valuenow={atual}
    >
      <div
        className={tone === 'alerta' ? `${styles.preenchimento} ${styles.alerta}` : styles.preenchimento}
        style={{ width: `${porcentagem}%` }}
      />
    </div>
  );
}
