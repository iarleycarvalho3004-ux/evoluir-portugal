import { Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { entregarArquivo, lerTextoDoArquivo } from '../../core/backup/entrega';
import { lerDadosAtuais, nomeDoArquivo } from '../../core/backup/exportar';
import { LIMITE_BYTES } from '../../core/backup/formato';
import type { BackupArquivo, DadosBackup } from '../../core/backup/formato';
import { aplicarRestauracao, gerarPrevia, planejarRestauracao } from '../../core/backup/restaurar';
import type { EscolhaConflito, Modo, PlanoRestauracao, Previa } from '../../core/backup/restaurar';
import { criarSnapshot, verificarSnapshot } from '../../core/backup/snapshots';
import { validarBackup } from '../../core/backup/validacao';
import { descreverErroDeArmazenamento } from '../../core/db/erros';
import type { Snapshot } from '../../core/db/types';
import { formatarData } from '../../core/utils/formatarData';
import { Alerta, Button, ChoiceGroup, FormSection } from '../../design';
import type { Choice } from '../../design';
import { descreverPlano } from './descricoes';
import styles from './RestoreFlow.module.css';

type Etapa = 'inicio' | 'validando' | 'previa' | 'protegendo' | 'confirmar' | 'restaurando' | 'concluido';

export type EntradaDeRestauracao = { id: number; nome: string; texto: string; modo?: Modo };

const PASSOS = ['Escolher', 'Revisar', 'Proteger', 'Confirmar'];
const PASSO_DA_ETAPA: Record<Etapa, number> = {
  inicio: 0,
  validando: 0,
  previa: 1,
  protegendo: 2,
  confirmar: 3,
  restaurando: 3,
  concluido: 4,
};

const MODOS: Choice<Modo>[] = [
  {
    value: 'mesclar',
    label: 'Mesclar',
    description: 'Mantém o que você já tem e acrescenta o que está no backup. Conflitos são resolvidos conforme sua escolha.',
  },
  {
    value: 'substituir',
    label: 'Substituir tudo',
    description: 'Apaga os dados atuais e deixa o aparelho exatamente como o backup. Ideal ao trocar de aparelho.',
  },
];

function opcoesDeConflito(atualEm: string, backupEm: string): Choice<EscolhaConflito>[] {
  return [
    {
      value: 'mais-recente',
      label: 'Manter o mais recente',
      description: `Fica a versão alterada por último. Este aparelho: ${formatarData(atualEm)}. Backup: ${formatarData(backupEm)}.`,
    },
    { value: 'manter-atual', label: 'Manter o deste aparelho', description: 'Ignora o perfil que está no backup.' },
    { value: 'usar-backup', label: 'Usar o do backup', description: 'Troca o perfil deste aparelho pelo do backup.' },
  ];
}

type Props = { entrada: EntradaDeRestauracao | null; aoMudar: () => void };

export function RestoreFlow({ entrada, aoMudar }: Props) {
  const [etapa, setEtapa] = useState<Etapa>('inicio');
  const [nome, setNome] = useState('');
  const [backup, setBackup] = useState<BackupArquivo | null>(null);
  const [atual, setAtual] = useState<DadosBackup | null>(null);
  const [previa, setPrevia] = useState<Previa | null>(null);
  const [modo, setModo] = useState<Modo>('mesclar');
  const [escolha, setEscolha] = useState<EscolhaConflito>('mais-recente');
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [plano, setPlano] = useState<PlanoRestauracao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [desfeito, setDesfeito] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const entradaProcessada = useRef<number | null>(null);
  const secao = useRef<HTMLDivElement>(null);

  function reiniciar() {
    setEtapa('inicio');
    setNome('');
    setBackup(null);
    setAtual(null);
    setPrevia(null);
    setModo('mesclar');
    setEscolha('mais-recente');
    setSnapshot(null);
    setPlano(null);
    setErro(null);
    setAviso(null);
    setDesfeito(false);
    setOcupado(false);
  }

  async function iniciar(nomeDoArquivo: string, texto: string, tamanho: number | undefined, modoInicial: Modo = 'mesclar') {
    setErro(null);
    setAviso(null);
    setNome(nomeDoArquivo);
    setEtapa('validando');
    try {
      const resultado = await validarBackup(texto, tamanho);
      if (!resultado.ok) {
        setErro(resultado.erro.mensagem);
        setEtapa('inicio');
        return;
      }
      const dadosAtuais = await lerDadosAtuais();
      setBackup(resultado.backup);
      setAtual(dadosAtuais);
      setPrevia(gerarPrevia(dadosAtuais, resultado.backup));
      setModo(modoInicial);
      setEscolha('mais-recente');
      setEtapa('previa');
    } catch (e) {
      setErro(descreverErroDeArmazenamento(e));
      setEtapa('inicio');
    }
  }

  useEffect(() => {
    if (!entrada || entradaProcessada.current === entrada.id) return;
    entradaProcessada.current = entrada.id;
    secao.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    void iniciar(entrada.nome, entrada.texto, undefined, entrada.modo);
  }, [entrada]);

  async function aoEscolherArquivo(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!arquivo) return;
    if (arquivo.size > LIMITE_BYTES) {
      setErro('O arquivo é grande demais para ser um backup válido (limite de 25 MB).');
      return;
    }
    try {
      const texto = await lerTextoDoArquivo(arquivo);
      await iniciar(arquivo.name, texto, arquivo.size);
    } catch {
      setErro('Não foi possível ler o arquivo escolhido.');
    }
  }

  async function continuar() {
    if (!backup || !atual) return;
    setErro(null);
    setEtapa('protegendo');
    try {
      const criado = await criarSnapshot('before-restore');
      setSnapshot(criado);
      const dadosAtuais = await lerDadosAtuais();
      setAtual(dadosAtuais);
      setPlano(planejarRestauracao(dadosAtuais, backup.data, modo, { profile: escolha }));
      aoMudar();
      setEtapa('confirmar');
    } catch {
      setErro('Não foi possível criar e verificar a cópia de segurança. Nada foi alterado.');
      setEtapa('previa');
    }
  }

  async function restaurar() {
    if (!plano) return;
    setErro(null);
    setEtapa('restaurando');
    try {
      await aplicarRestauracao(plano);
      aoMudar();
      setEtapa('concluido');
    } catch {
      setErro('A restauração falhou e foi desfeita automaticamente. Seus dados continuam como estavam.');
      setEtapa('confirmar');
    }
  }

  async function desfazer() {
    if (!snapshot) return;
    setOcupado(true);
    setErro(null);
    try {
      const verificado = await verificarSnapshot(snapshot.id);
      if (!verificado.ok) throw new Error(verificado.motivo);
      await criarSnapshot('before-undo');
      const dadosAtuais = await lerDadosAtuais();
      await aplicarRestauracao(planejarRestauracao(dadosAtuais, verificado.backup.data, 'substituir', { profile: 'mais-recente' }));
      setDesfeito(true);
      aoMudar();
    } catch {
      setErro('Não foi possível desfazer a restauração. Seus dados atuais não foram alterados por esta tentativa.');
    } finally {
      setOcupado(false);
    }
  }

  async function salvarSnapshot() {
    if (!snapshot) return;
    try {
      const resultado = await entregarArquivo(nomeDoArquivo(new Date(snapshot.createdAt), 'evoluir-portugal-copia'), snapshot.payload);
      setAviso(resultado === 'cancelado' ? 'Cancelado. A cópia continua guardada no app.' : 'Cópia de segurança entregue.');
    } catch {
      setAviso('Não foi possível salvar a cópia agora. Ela continua guardada no app.');
    }
  }

  const passoAtual = PASSO_DA_ETAPA[etapa];
  const substituir = modo === 'substituir';

  return (
    <div ref={secao} id="restaurar">
      <FormSection icon={Upload} title="Restaurar backup" subtitle="Seus dados só mudam depois da sua confirmação">
        <ol className={styles.passos} aria-label="Etapas da restauração">
          {PASSOS.map((rotulo, indice) => (
            <li
              key={rotulo}
              className={indice < passoAtual ? `${styles.passo} ${styles.feito}` : indice === passoAtual ? `${styles.passo} ${styles.ativo}` : styles.passo}
              aria-current={indice === passoAtual ? 'step' : undefined}
            >
              <span className={styles.barra} />
              <span className={styles.rotulo}>{rotulo}</span>
            </li>
          ))}
        </ol>

        {erro ? (
          <Alerta tone="aviso" title="Atenção">
            {erro}
          </Alerta>
        ) : null}

        {etapa === 'inicio' ? (
          <div className={styles.bloco}>
            <p className={styles.texto}>
              Escolha um arquivo de backup do EVOLUIR PORTUGAL. O arquivo é verificado por completo antes de qualquer mudança.
            </p>
            <label className={styles.arquivo}>
              <input type="file" accept=".json,application/json" className={styles.entradaArquivo} onChange={(e) => void aoEscolherArquivo(e)} />
              <span className={styles.botaoArquivo}>Escolher arquivo de backup</span>
            </label>
          </div>
        ) : null}

        {etapa === 'validando' ? <p className={styles.texto}>Verificando o arquivo…</p> : null}

        {etapa === 'previa' && previa ? (
          <div className={styles.bloco}>
            <dl className={styles.dados}>
              <dt>Arquivo</dt>
              <dd className={styles.quebra}>{nome}</dd>
              <dt>Criado em</dt>
              <dd>{formatarData(previa.exportadoEm)}</dd>
              <dt>Versão do app</dt>
              <dd>{previa.versaoApp}</dd>
              <dt>Período</dt>
              <dd>
                {previa.periodo.inicio && previa.periodo.fim
                  ? `${formatarData(previa.periodo.inicio)} a ${formatarData(previa.periodo.fim)}`
                  : 'Sem registros'}
              </dd>
              <dt>Perfil</dt>
              <dd>
                {previa.contagens.profile.backup} no backup · {previa.contagens.profile.atual} neste aparelho
              </dd>
              <dt>Configurações</dt>
              <dd>
                {previa.contagens.settings.backup} no backup · {previa.contagens.settings.atual} neste aparelho
              </dd>
            </dl>

            <Alerta tone="info" title="Arquivo íntegro">
              A verificação de integridade passou e todos os campos estão em ordem.
            </Alerta>

            <ChoiceGroup name="modo-restauracao" legend="Como restaurar?" options={MODOS} value={modo} onChange={(v) => v !== '' && setModo(v)} />

            {modo === 'mesclar' && previa.conflitos[0] ? (
              <ChoiceGroup
                name="conflito-perfil"
                legend="O perfil do backup é diferente do deste aparelho"
                options={opcoesDeConflito(previa.conflitos[0].atualEm, previa.conflitos[0].backupEm)}
                value={escolha}
                onChange={(v) => v !== '' && setEscolha(v)}
              />
            ) : null}
            {modo === 'mesclar' && previa.conflitos.length === 0 ? (
              <p className={styles.texto}>Nenhum conflito: o backup só acrescenta o que falta.</p>
            ) : null}

            <div className={styles.acoes}>
              <Button variant="secundario" onClick={reiniciar}>
                Cancelar
              </Button>
              <Button onClick={() => void continuar()}>Continuar</Button>
            </div>
          </div>
        ) : null}

        {etapa === 'protegendo' ? <p className={styles.texto}>Criando e verificando a cópia de segurança dos seus dados atuais…</p> : null}

        {etapa === 'confirmar' && snapshot && plano ? (
          <div className={styles.bloco}>
            <Alerta tone="info" title="Cópia de segurança criada e verificada">
              Feita em {formatarData(snapshot.createdAt)}, com {snapshot.recordCounts.profile ?? 0} perfil e{' '}
              {snapshot.recordCounts.settings ?? 0} configurações. Dá para desfazer a restauração por ela.
            </Alerta>
            {substituir ? (
              <Alerta tone="aviso" title="Você vai substituir tudo">
                Recomendado: salve a cópia em Arquivos antes de continuar.
              </Alerta>
            ) : null}
            <ul className={styles.lista}>
              {descreverPlano(plano).map((frase) => (
                <li key={frase}>{frase}</li>
              ))}
            </ul>
            {aviso ? (
              <p className={styles.texto} role="status">
                {aviso}
              </p>
            ) : null}
            <div className={styles.acoes}>
              <Button variant="secundario" onClick={() => void salvarSnapshot()}>
                Salvar cópia em Arquivos
              </Button>
            </div>
            <div className={styles.acoes}>
              <Button variant="secundario" onClick={reiniciar}>
                Cancelar
              </Button>
              <Button variant={substituir ? 'perigo' : 'primario'} onClick={() => void restaurar()}>
                Restaurar agora
              </Button>
            </div>
          </div>
        ) : null}

        {etapa === 'restaurando' ? <p className={styles.texto}>Restaurando…</p> : null}

        {etapa === 'concluido' ? (
          <div className={styles.bloco}>
            <Alerta tone="info" title={desfeito ? 'Restauração desfeita' : 'Restauração concluída'}>
              {desfeito
                ? 'Seus dados voltaram ao estado anterior.'
                : 'Seus dados foram restaurados. Se algo não ficou como esperado, você pode desfazer.'}
            </Alerta>
            <div className={styles.acoes}>
              {desfeito ? null : (
                <Button variant="secundario" onClick={() => void desfazer()} disabled={ocupado}>
                  {ocupado ? 'Desfazendo…' : 'Desfazer restauração'}
                </Button>
              )}
              <Button onClick={reiniciar}>Concluir</Button>
            </div>
          </div>
        ) : null}
      </FormSection>
    </div>
  );
}
