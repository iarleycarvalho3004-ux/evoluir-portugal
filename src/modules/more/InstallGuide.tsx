import { Check } from 'lucide-react';
import { Card } from '../../design';
import { detectarInstalacao, lerAmbiente } from '../../core/pwa/instalacao';
import type { Ambiente } from '../../core/pwa/instalacao';
import styles from './InstallGuide.module.css';

type InstallProps = { ambiente?: Ambiente };

/** Guia de instalação. Some quando o app já está instalado (o selo discreto assume). */
export function InstallGuide({ ambiente }: InstallProps) {
  const estado = detectarInstalacao(ambiente ?? lerAmbiente());

  if (estado === 'instalado') return null;

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

/** Selo de uma linha, só quando o app já está instalado. */
export function InstallBadge({ ambiente }: InstallProps) {
  if (detectarInstalacao(ambiente ?? lerAmbiente()) !== 'instalado') return null;
  return (
    <p className={styles.selo}>
      <Check size={14} aria-hidden="true" />
      App instalado na Tela de Início
    </p>
  );
}
