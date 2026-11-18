import { Card } from './Card';
import styles from './Stat.module.css';

type StatProps = {
  label: string;
  /** Use null quando ainda não há registro. */
  value: string | null;
  unit?: string;
  note?: string;
};

export function Stat({ label, value, unit, note }: StatProps) {
  return (
    <Card>
      <p className={styles.rotulo}>{label}</p>
      <p className={styles.valor}>
        {value === null ? (
          <span role="img" aria-label="sem dados">
            —
          </span>
        ) : (
          <>
            {value}
            {unit ? <span className={styles.unidade}> {unit}</span> : null}
          </>
        )}
      </p>
      {note ? <p className={styles.nota}>{note}</p> : null}
    </Card>
  );
}
