import type { ReactNode } from 'react';
import styles from './Field.module.css';

export type ControlProps = {
  id: string;
  className: string;
  'aria-describedby': string | undefined;
  'aria-invalid': boolean;
};

type FieldProps = {
  id: string;
  label: string;
  /** Explica para que serve a informação. */
  hint?: string;
  error?: string;
  children: (controle: ControlProps) => ReactNode;
};

export function Field({ id, label, hint, error, children }: FieldProps) {
  const ids = [hint ? `${id}-ajuda` : null, error ? `${id}-erro` : null].filter(Boolean).join(' ');
  return (
    <div className={styles.campo}>
      <label htmlFor={id} className={styles.rotulo}>
        {label}
      </label>
      {children({
        id,
        className: styles.controle,
        'aria-describedby': ids || undefined,
        'aria-invalid': Boolean(error),
      })}
      {hint ? (
        <p id={`${id}-ajuda`} className={styles.ajuda}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-erro`} className={styles.erro}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
