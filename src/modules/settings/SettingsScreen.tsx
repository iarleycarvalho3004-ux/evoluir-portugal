import { Archive, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, FormSection, ScreenHeader } from '../../design';
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
      <ScreenHeader title="Configurações" subtitle="Seu perfil e a segurança dos seus dados" />
      <div className={styles.secoes}>
        <ProfileSection />
        <StorageSection />
        <FormSection icon={Archive} title="Backup e restauração" subtitle="Exporte e restaure seus dados">
          <div>
            <Button to="/mais/backup" variant="secundario">
              Abrir backup
            </Button>
          </div>
        </FormSection>
      </div>
    </>
  );
}
