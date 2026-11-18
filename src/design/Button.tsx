import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

type ButtonProps = {
  children: ReactNode;
  variant?: 'primario' | 'secundario' | 'perigo';
  /** Quando informado, o botão navega para a rota (renderiza um link). */
  to?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
};

export function Button({ children, variant = 'primario', to, onClick, type = 'button', disabled }: ButtonProps) {
  const classe = `${styles.botao} ${styles[variant]}`;
  if (to) {
    return (
      <Link to={to} className={classe}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={classe} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
