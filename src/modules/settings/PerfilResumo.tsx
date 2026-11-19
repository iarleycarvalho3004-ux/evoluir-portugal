import { Card } from '../../design';
import type { ResumoPerfil } from './resumo';
import styles from './PerfilResumo.module.css';

const formatar = (numero: number) => numero.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

function textoDiferenca(diferenca: number): string {
  if (diferenca > 0) return `Faltam ${formatar(diferenca)} kg para a meta`;
  if (diferenca < 0) return `${formatar(Math.abs(diferenca))} kg acima da meta`;
  return 'Você está na meta';
}

type MetricaProps = { rotulo: string; valor: number | null; unidade: string };

function Metrica({ rotulo, valor, unidade }: MetricaProps) {
  return (
    <div className={styles.metrica}>
      <p className={styles.rotulo}>{`${rotulo} (${unidade})`}</p>
      <p className={styles.valor}>
        {valor === null ? (
          <span role="img" aria-label="não informado">
            —
          </span>
        ) : (
          formatar(valor)
        )}
      </p>
    </div>
  );
}

/** Painel do perfil: números grandes que acompanham o formulário em tempo real. */
export function PerfilResumo({ resumo }: { resumo: ResumoPerfil }) {
  return (
    <Card>
      <div className={styles.topo}>
        <p className={styles.titulo}>Seu perfil</p>
        <p className={styles.progresso}>
          {resumo.preenchidos} de {resumo.total}
        </p>
      </div>
      <div className={styles.segmentos} aria-hidden="true">
        {Array.from({ length: resumo.total }, (_, indice) => (
          <span key={indice} className={indice < resumo.preenchidos ? `${styles.segmento} ${styles.cheio}` : styles.segmento} />
        ))}
      </div>
      <div className={styles.metricas}>
        <Metrica rotulo="Altura" valor={resumo.alturaCm} unidade="cm" />
        <Metrica rotulo="Peso" valor={resumo.pesoKg} unidade="kg" />
        <Metrica rotulo="Meta" valor={resumo.metaKg} unidade="kg" />
      </div>
      {resumo.imc !== null || resumo.diferencaKg !== null ? (
        <div className={styles.chips}>
          {resumo.imc !== null ? <span className={styles.chip}>{`IMC ${formatar(resumo.imc)}`}</span> : null}
          {resumo.diferencaKg !== null ? <span className={styles.chip}>{textoDiferenca(resumo.diferencaKg)}</span> : null}
        </div>
      ) : null}
      <p className={styles.nota}>
        {resumo.preenchidos === 0
          ? 'Preencha o que quiser. Nada é obrigatório.'
          : 'Quanto mais você preenche, mais precisos ficam os cálculos.'}
      </p>
    </Card>
  );
}
