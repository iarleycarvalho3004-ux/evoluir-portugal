import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, ScreenHeader } from '../../design';
import { ProfileSection } from './ProfileSection';
import { StorageSection } from './StorageSection';
import styles from './SettingsScreen.module.css';

export function SettingsScreen() {
  return (
    <>
      <Link to="/mais" className={styles.voltar} aria-label="Voltar para Mais">
        <ChevronLeft size={20} aria-hidden="true" />
        Mais
      </Link>
      <ScreenHeader title="Configurações" subtitle="Perfil e armazenamento" />
      <div className={styles.secoes}>
        <ProfileSection />
        <StorageSection />
        <Card>
          <h2 className={styles.titulo}>Backup e restauração</h2>
          <p className={styles.texto}>Iarley vai desenvolver na V0.5.</p>
        </Card>
      </div>
    </>
  );
}
