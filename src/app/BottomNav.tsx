import { NavLink } from 'react-router-dom';
import { FlagBar } from '../design';
import { navItems } from './navigation';
import styles from './BottomNav.module.css';

export function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      <div className={styles.lista}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => (isActive ? `${styles.item} ${styles.ativo}` : styles.item)}
          >
            <span className={styles.marca}>
              <FlagBar size="sm" />
            </span>
            <Icon size={24} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
