import { Card } from '../../design';
import { detectarInstalacao, lerAmbiente } from '../../core/pwa/instalacao';
import type { Ambiente } from '../../core/pwa/instalacao';
import styles from './InstallGuide.module.css';

type InstallGuideProps = { ambiente?: Ambiente };

export function InstallGuide({ ambiente }: InstallGuideProps) {
  const estado = detectarInstalacao(ambiente ?? lerAmbiente());

  if (estado === 'instalado') {
    return (
      <Card>
        <h2 className={styles.titulo}>App instalado</h2>
        <p className={styles.texto}>
          Você está usando o EVOLUIR PORTUGAL pela Tela de Início. Seus dados ficam guardados neste aparelho.
        </p>
        <p className={styles.nota}>
          O armazenamento do iPhone não é garantido. O backup, que ainda será desenvolvido, é a proteção real.
        </p>
      </Card>
    );
  }

  if (estado === 'ios-safari') {
    return (
      <Card>
        <h2 className={styles.titulo}>Instalar na Tela de Início</h2>
        <ol className={styles.passos}>
          <li>Toque em Compartilhar, o ícone de quadrado com seta, na barra do Safari.</li>
          <li>Role a lista e toque em Adicionar à Tela de Início.</li>
          <li>Confirme em Adicionar e abra o app pelo novo ícone.</li>
        </ol>
        <p className={styles.nota}>
          Instale antes de registrar qualquer dado. O Safari e o app instalado guardam dados separados.
        </p>
      </Card>
    );
  }

  if (estado === 'ios-outro') {
    return (
      <Card>
        <h2 className={styles.titulo}>Instalar na Tela de Início</h2>
        <p className={styles.texto}>
          Abra este endereço no Safari para instalar. Cada navegador guarda os dados separadamente.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className={styles.titulo}>Instalar na Tela de Início</h2>
      <p className={styles.texto}>
        A instalação é feita pelo Safari do iPhone. No computador, o app funciona direto no navegador.
      </p>
    </Card>
  );
}
