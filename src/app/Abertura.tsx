import { useEffect, useState } from 'react';
import styles from './Abertura.module.css';

export const DURACAO_MS = 3200;
export const SAIDA_MS = 450;
const DURACAO_REDUZIDA_MS = 1000;
const CHAVE_SESSAO = 'evoluir:abertura-vista';

type Fase = 'ativa' | 'saindo' | 'fim';

function jaFoiVista(): boolean {
  try {
    return window.sessionStorage.getItem(CHAVE_SESSAO) === '1';
  } catch {
    return false;
  }
}

function marcarComoVista(): void {
  try {
    window.sessionStorage.setItem(CHAVE_SESSAO, '1');
  } catch {
    /* sem armazenamento de sessão: a abertura apenas pode repetir */
  }
}

/** Abertura do app: aparece uma vez por sessão e pode ser pulada com um toque. */
export function Abertura() {
  const [fase, setFase] = useState<Fase>(() => (jaFoiVista() ? 'fim' : 'ativa'));

  useEffect(() => {
    if (fase !== 'ativa') return;
    marcarComoVista();
    const reduzir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
    const timer = window.setTimeout(() => setFase('saindo'), reduzir ? DURACAO_REDUZIDA_MS : DURACAO_MS);
    return () => window.clearTimeout(timer);
  }, [fase]);

  useEffect(() => {
    if (fase !== 'saindo') return;
    const timer = window.setTimeout(() => setFase('fim'), SAIDA_MS);
    return () => window.clearTimeout(timer);
  }, [fase]);

  if (fase === 'fim') return null;

  return (
    <div
      className={fase === 'saindo' ? `${styles.abertura} ${styles.saindo}` : styles.abertura}
      onClick={() => setFase((atual) => (atual === 'ativa' ? 'saindo' : atual))}
      data-testid="abertura"
      aria-hidden="true"
    >
      <div className={styles.conteudo}>
        <div className={styles.palco}>
          <div className={styles.faixas}>
            <span className={styles.verde} />
            <span className={styles.vermelha} />
          </div>
          <span className={`${styles.barra} ${styles.haste}`} />
          <span className={`${styles.barra} ${styles.bracoTopo}`} />
          <span className={`${styles.barra} ${styles.bracoMeio}`} />
          <span className={`${styles.barra} ${styles.bracoBase}`} />
        </div>
        <div className={styles.mascara}>
          <p className={styles.nome}>EVOLUIR PORTUGAL</p>
        </div>
      </div>
    </div>
  );
}
