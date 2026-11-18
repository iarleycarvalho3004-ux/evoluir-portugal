import { Route, Routes } from 'react-router-dom';
import { BodyScreen } from '../modules/body/BodyScreen';
import { DashboardScreen } from '../modules/dashboard/DashboardScreen';
import { MoreScreen } from '../modules/more/MoreScreen';
import { NutritionScreen } from '../modules/nutrition/NutritionScreen';
import { TrainingScreen } from '../modules/training/TrainingScreen';
import { BottomNav } from './BottomNav';
import { NotFoundScreen } from './NotFoundScreen';
import styles from './App.module.css';

export function App() {
  return (
    <div className={styles.app}>
      <main className={styles.conteudo}>
        <Routes>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/treino" element={<TrainingScreen />} />
          <Route path="/nutricao" element={<NutritionScreen />} />
          <Route path="/evolucao" element={<BodyScreen />} />
          <Route path="/mais" element={<MoreScreen />} />
          <Route path="*" element={<NotFoundScreen />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
