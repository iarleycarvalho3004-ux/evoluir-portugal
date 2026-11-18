import { Button } from '../design';
import styles from './AvisoAtualizacao.module.css';

type AvisoAtualizacaoProps = { onAtualizar: () => void };

export function AvisoAtualizacao({ onAtualizar }: AvisoAtualizacaoProps) {
  return (
    <div className={styles.aviso} role="status">
      <p className={styles.texto}>Nova versão disponível</p>
      <Button onClick={onAtualizar}>Atualizar</Button>
    </div>
  );
}
