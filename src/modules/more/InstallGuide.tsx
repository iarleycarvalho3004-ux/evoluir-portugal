import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button, Card } from '../../design';
import { detectarInstalacao, lerAmbiente } from '../../core/pwa/instalacao';
import type { Ambiente, EstadoInstalacao } from '../../core/pwa/instalacao';
import { usePromptInstalacao } from '../../core/pwa/promptInstalacao';
import styles from './InstallGuide.module.css';

type InstallProps = { ambiente?: Ambiente };

const NOTA_IOS =
  'Instale antes de registrar qualquer dado. O Safari e o app instalado guardam dados separados. Se já registrou dados no Safari, faça um backup em Mais → Backup e restaure no app instalado.';
const NOTA_ANDROID =
  'Depois de instalar, abra o app pelo novo ícone. Se já registrou dados antes de instalar, faça um backup em Mais → Backup por segurança.';

type Roteiro = { titulo: string; passos: string[]; nota: string };

const ROTEIROS: Partial<Record<EstadoInstalacao, Roteiro>> = {
  'ios-safari': {
    titulo: 'Instalar na Tela de Início',
    passos: [
      'Toque em Compartilhar, o ícone de quadrado com seta, na barra do Safari.',
      'Role a lista e toque em Adicionar à Tela de Início.',
      'Confirme em Adicionar e abra o app pelo novo ícone.',
    ],
    nota: NOTA_IOS,
  },
  'android-chrome': {
    titulo: 'Instalar na tela inicial',
    passos: [
      'Toque nos três pontinhos (⋮) no canto do navegador.',
      'Toque em Instalar app ou em Adicionar à tela inicial.',
      'Confirme em Instalar e abra o app pelo novo ícone.',
    ],
    nota: NOTA_ANDROID,
  },
  'android-samsung': {
    titulo: 'Instalar na tela inicial',
    passos: [
      'Toque no menu (≡) na barra inferior do Samsung Internet.',
      'Toque em Adicionar página a e escolha Tela inicial.',
      'Confirme em Adicionar e abra o app pelo novo ícone.',
    ],
    nota: NOTA_ANDROID,
  },
  'android-firefox': {
    titulo: 'Instalar na tela inicial',
    passos: [
      'Toque nos três pontinhos (⋮) no canto do Firefox.',
      'Toque em Instalar.',
      'Confirme em Adicionar à tela inicial e abra o app pelo novo ícone.',
    ],
    nota: NOTA_ANDROID,
  },
};

function CartaoDeRoteiro({ roteiro, topo }: { roteiro: Roteiro; topo?: ReactNode }) {
  return (
    <Card>
      <h2 className={styles.titulo}>{roteiro.titulo}</h2>
      {topo}
      <ol className={styles.passos}>
        {roteiro.passos.map((passo) => (
          <li key={passo}>{passo}</li>
        ))}
      </ol>
      <p className={styles.nota}>{roteiro.nota}</p>
    </Card>
  );
}

/** No Chrome do Android, o navegador pode oferecer a instalação com um toque. */
function RoteiroChromeAndroid({ roteiro }: { roteiro: Roteiro }) {
  const { disponivel, instalar } = usePromptInstalacao();
  const topo = disponivel ? (
    <div className={styles.instalarAgora}>
      <Button onClick={() => void instalar()}>Instalar agora</Button>
      <p className={styles.nota}>Ou siga os passos abaixo.</p>
    </div>
  ) : null;
  return <CartaoDeRoteiro roteiro={roteiro} topo={topo} />;
}

/** Guia de instalação do sistema do aparelho. Some quando o app já está instalado (o selo discreto assume). */
export function InstallGuide({ ambiente }: InstallProps) {
  const estado = detectarInstalacao(ambiente ?? lerAmbiente());

  if (estado === 'instalado') return null;

  if (estado === 'android-chrome') {
    const roteiro = ROTEIROS['android-chrome'];
    return roteiro ? <RoteiroChromeAndroid roteiro={roteiro} /> : null;
  }

  const roteiro = ROTEIROS[estado];
  if (roteiro) return <CartaoDeRoteiro roteiro={roteiro} />;

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
      <h2 className={styles.titulo}>Instalar o app</h2>
      <p className={styles.texto}>
        A instalação é feita pelo navegador do celular (Safari no iPhone, Chrome no Android). No computador, o app
        funciona direto no navegador.
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
