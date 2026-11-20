import { Route, Routes } from 'react-router-dom';
import { useVersaoNova } from '../core/update/useVersaoNova';
import type { buscarVersaoPublicada } from '../core/update/versao';
import { BackupScreen } from '../modules/backup/BackupScreen';
import { BodyScreen } from '../modules/body/BodyScreen';
import { DashboardScreen } from '../modules/dashboard/DashboardScreen';
import { MoreScreen } from '../modules/more/MoreScreen';
import { NutritionScreen } from '../modules/nutrition/NutritionScreen';
import { SettingsScreen } from '../modules/settings/SettingsScreen';
import { TrainingScreen } from '../modules/training/TrainingScreen';
import { AvisoAtualizacao } from './AvisoAtualizacao';
import { BottomNav } from './BottomNav';
import { NotFoundScreen } from './NotFoundScreen';
import styles from './App.module.css';

type AppProps = { buscarVersao?: typeof buscarVersaoPublicada };

export function App({ buscarVersao }: AppProps = {}) {
  const versaoNova = useVersaoNova(buscarVersao);

  return (
    <div className={styles.app}>
      <main className={styles.conteudo}>
        <Routes>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/treino" element={<TrainingScreen />} />
          <Route path="/nutricao" element={<NutritionScreen />} />
          <Route path="/evolucao" element={<BodyScreen />} />
          <Route path="/mais" element={<MoreScreen />} />
          <Route path="/mais/configuracoes" element={<SettingsScreen />} />
          <Route path="/mais/backup" element={<BackupScreen />} />
          <Route path="*" element={<NotFoundScreen />} />
        </Routes>
      </main>
      {versaoNova ? <AvisoAtualizacao onAtualizar={() => window.location.reload()} /> : null}
      <BottomNav />
    </div>
  );
}
