import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Abertura } from './app/Abertura';
import { App } from './app/App';
import { iniciarCapturaDeInstalacao } from './core/pwa/promptInstalacao';
import { solicitarPersistencia } from './core/storage/armazenamento';
import './design/tokens.css';
import './app/global.css';

// Pede ao navegador que trate os dados como persistentes. O iOS pode ignorar o pedido.
void solicitarPersistencia();
iniciarCapturaDeInstalacao();

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado.');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <Abertura />
  </StrictMode>,
);
