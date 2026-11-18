import styles from './App.module.css';

function formatarData(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return 'indisponível';
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function App() {
  return (
    <main className={styles.pagina}>
      <div className={styles.faixa} aria-hidden="true">
        <span />
        <span />
      </div>
      <h1 className={styles.titulo}>EVOLUIR PORTUGAL</h1>
      <p className={styles.texto}>
        Página de verificação da Etapa 2A. Se você está vendo isto no iPhone, a publicação
        automática funciona. O aplicativo em si ainda não foi desenvolvido.
      </p>
      <dl className={styles.dados}>
        <dt>Versão</dt>
        <dd>{__APP_VERSION__}</dd>
        <dt>Gerado em</dt>
        <dd>{formatarData(__BUILD_TIME__)}</dd>
      </dl>
    </main>
  );
}
