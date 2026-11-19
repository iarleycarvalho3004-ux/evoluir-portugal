import { Ruler, Target, User, Utensils } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { descreverErroDeArmazenamento } from '../../core/db/erros';
import { apagarPerfil, lerPerfil, salvarPerfil } from '../../core/db/repositorios';
import type { Profile, Sex } from '../../core/db/types';
import { Alerta, Button, Card, ChoiceGroup, Field, FormSection, TagPicker } from '../../design';
import type { Choice } from '../../design';
import { OBJETIVOS, SUGESTOES_RESTRICOES } from './objetivos';
import { PerfilResumo } from './PerfilResumo';
import { formularioDoPerfil, formularioVazio, lerFormulario } from './perfilForm';
import type { ErrosFormulario, PerfilFormulario } from './perfilForm';
import { resumirFormulario } from './resumo';
import styles from './ProfileSection.module.css';

type Carga = 'carregando' | 'pronto' | 'erro';
type Mensagem = { tipo: 'ok' | 'erro'; texto: string };
type ModoIdade = 'data' | 'idade';

const MODOS: Choice<ModoIdade>[] = [
  { value: 'data', label: 'Data' },
  { value: 'idade', label: 'Idade' },
];
const SEXOS: Choice<Sex>[] = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' },
];

export function ProfileSection() {
  const [carga, setCarga] = useState<Carga>('carregando');
  const [erroDeCarga, setErroDeCarga] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [perfilSalvo, setPerfilSalvo] = useState<Profile | null>(null);
  const [formulario, setFormulario] = useState<PerfilFormulario>({ ...formularioVazio, restricoes: [] });
  const [modoIdade, setModoIdade] = useState<ModoIdade>('data');
  const [erros, setErros] = useState<ErrosFormulario>({});
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmandoApagar, setConfirmandoApagar] = useState(false);

  const inicial = useMemo(() => formularioDoPerfil(perfilSalvo), [perfilSalvo]);
  const sujo = useMemo(() => JSON.stringify(formulario) !== JSON.stringify(inicial), [formulario, inicial]);
  const resumo = useMemo(() => resumirFormulario(formulario), [formulario]);

  useEffect(() => {
    let ativo = true;
    setCarga('carregando');
    lerPerfil()
      .then((perfil) => {
        if (!ativo) return;
        const lido = formularioDoPerfil(perfil);
        setPerfilSalvo(perfil);
        setFormulario(lido);
        setModoIdade(lido.idadeAprox !== '' ? 'idade' : 'data');
        setCarga('pronto');
      })
      .catch((erro: unknown) => {
        if (!ativo) return;
        setErroDeCarga(descreverErroDeArmazenamento(erro));
        setCarga('erro');
      });
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  useEffect(() => {
    if (mensagem?.tipo !== 'ok') return;
    const timer = window.setTimeout(() => setMensagem(null), 4000);
    return () => window.clearTimeout(timer);
  }, [mensagem]);

  function atualizar<K extends keyof PerfilFormulario>(campo: K, valor: PerfilFormulario[K]) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
    setMensagem(null);
  }

  function trocarModo(novo: ModoIdade) {
    setModoIdade(novo);
    setFormulario((atual) => (novo === 'data' ? { ...atual, idadeAprox: '' } : { ...atual, nascimento: '' }));
    setErros((atual) => ({ ...atual, nascimento: undefined, idadeAprox: undefined }));
    setMensagem(null);
  }

  function descartar() {
    setFormulario(inicial);
    setModoIdade(inicial.idadeAprox !== '' ? 'idade' : 'data');
    setErros({});
    setMensagem(null);
  }

  async function aoSalvar(evento: FormEvent) {
    evento.preventDefault();
    const resultado = lerFormulario(formulario);
    if (!resultado.ok) {
      setErros(resultado.erros);
      setMensagem({ tipo: 'erro', texto: 'Corrija os campos destacados para salvar.' });
      return;
    }
    setErros({});
    setSalvando(true);
    try {
      const salvo = await salvarPerfil(resultado.dados);
      setPerfilSalvo(salvo);
      setFormulario(formularioDoPerfil(salvo));
      setMensagem({ tipo: 'ok', texto: 'Perfil salvo neste aparelho.' });
    } catch (erro) {
      setMensagem({
        tipo: 'erro',
        texto: `${descreverErroDeArmazenamento(erro)} O que você digitou continua na tela.`,
      });
    } finally {
      setSalvando(false);
    }
  }

  async function aoApagar() {
    try {
      await apagarPerfil();
      setPerfilSalvo(null);
      setFormulario({ ...formularioVazio, restricoes: [] });
      setModoIdade('data');
      setErros({});
      setMensagem({ tipo: 'ok', texto: 'Perfil apagado deste aparelho.' });
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: descreverErroDeArmazenamento(erro) });
    } finally {
      setConfirmandoApagar(false);
    }
  }

  if (carga === 'carregando') {
    return (
      <Card>
        <p className={styles.texto}>Carregando perfil…</p>
      </Card>
    );
  }

  if (carga === 'erro') {
    return (
      <FormSection icon={User} title="Perfil" subtitle="Não foi possível abrir">
        <Alerta tone="aviso" title="Não foi possível abrir o perfil">
          {erroDeCarga}
        </Alerta>
        <div>
          <Button variant="secundario" onClick={() => setTentativa((n) => n + 1)}>
            Tentar novamente
          </Button>
        </div>
      </FormSection>
    );
  }

  return (
    <form className={styles.formulario} onSubmit={aoSalvar} noValidate>
      <PerfilResumo resumo={resumo} />

      <FormSection icon={Ruler} title="Medidas" subtitle="De onde você parte e aonde quer chegar">
        <Field
          id="altura"
          label="Altura (cm)"
          hint="Para calcular o IMC e estimar o gasto calórico. Sem ela, esses cálculos ficam indisponíveis."
          error={erros.altura}
        >
          {(c) => (
            <input {...c} type="text" inputMode="decimal" value={formulario.altura} onChange={(e) => atualizar('altura', e.target.value)} />
          )}
        </Field>
        <Field
          id="peso"
          label="Peso atual (kg)"
          hint="Seu ponto de partida: serve para o IMC e para saber quanto falta até a meta. O histórico de peso começa com este valor."
          error={erros.peso}
        >
          {(c) => (
            <input {...c} type="text" inputMode="decimal" value={formulario.peso} onChange={(e) => atualizar('peso', e.target.value)} />
          )}
        </Field>
        <Field id="meta-peso" label="Meta de peso (kg)" hint="Para mostrar quanto falta para chegar lá." error={erros.metaPeso}>
          {(c) => (
            <input {...c} type="text" inputMode="decimal" value={formulario.metaPeso} onChange={(e) => atualizar('metaPeso', e.target.value)} />
          )}
        </Field>
      </FormSection>

      <FormSection icon={User} title="Sobre você" subtitle="Ajuda a estimar o gasto calórico">
        <ChoiceGroup
          name="modo-idade"
          legend="Como prefere informar a idade?"
          options={MODOS}
          value={modoIdade}
          onChange={(valor) => {
            if (valor !== '') trocarModo(valor);
          }}
        />
        {modoIdade === 'data' ? (
          <Field id="nascimento" label="Data de nascimento" hint="Usada só para calcular a idade na estimativa de gasto calórico." error={erros.nascimento}>
            {(c) => (
              <input {...c} type="date" value={formulario.nascimento} onChange={(e) => atualizar('nascimento', e.target.value)} />
            )}
          </Field>
        ) : (
          <Field
            id="idade"
            label="Idade aproximada (anos)"
            hint="Alternativa à data. Sem nenhuma das duas, o app usa uma estimativa genérica ou pede a meta de calorias manualmente."
            error={erros.idadeAprox}
          >
            {(c) => (
              <input {...c} type="text" inputMode="numeric" value={formulario.idadeAprox} onChange={(e) => atualizar('idadeAprox', e.target.value)} />
            )}
          </Field>
        )}
        <ChoiceGroup
          name="sexo"
          legend="Sexo"
          options={SEXOS}
          value={formulario.sexo}
          onChange={(valor) => atualizar('sexo', valor)}
          emptyLabel="Prefiro não informar"
          hint="Usado só na fórmula de gasto calórico. Pode deixar em branco."
          error={erros.sexo}
        />
      </FormSection>

      <FormSection icon={Target} title="Objetivo" subtitle="Orienta as sugestões de treino e alimentação">
        <ChoiceGroup
          name="objetivo"
          legend="O que você quer alcançar?"
          options={OBJETIVOS}
          value={formulario.objetivo}
          onChange={(valor) => atualizar('objetivo', valor)}
          emptyLabel="Não definido"
          emptyDescription="Toque em um objetivo para ver o que ele significa."
          error={erros.objetivo}
        />
      </FormSection>

      <FormSection icon={Utensils} title="Alimentação" subtitle="Para filtrar sugestões e substituições">
        <TagPicker
          id="restricoes"
          legend="Restrições alimentares"
          hint="Marque o que se aplica. Sem nenhuma marcada, nada é filtrado."
          error={erros.restricoes}
          suggestions={SUGESTOES_RESTRICOES}
          value={formulario.restricoes}
          onChange={(valor) => atualizar('restricoes', valor)}
        />
      </FormSection>

      {perfilSalvo ? (
        <Card>
          {confirmandoApagar ? (
            <div className={styles.apagar}>
              <p className={styles.texto}>Apagar o perfil deste aparelho? Isso não pode ser desfeito.</p>
              <div className={styles.acoes}>
                <Button variant="perigo" onClick={aoApagar}>
                  Confirmar exclusão
                </Button>
                <Button variant="secundario" onClick={() => setConfirmandoApagar(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.apagar}>
              <p className={styles.texto}>Os dados do perfil ficam só neste aparelho.</p>
              <div className={styles.acoes}>
                <Button variant="secundario" onClick={() => setConfirmandoApagar(true)}>
                  Apagar perfil
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : null}

      {sujo || mensagem ? (
        <div className={styles.barra} role="status">
          <p className={mensagem ? (mensagem.tipo === 'ok' ? styles.sucesso : styles.erro) : styles.textoBarra}>
            {mensagem ? mensagem.texto : 'Alterações não salvas'}
          </p>
          {sujo ? (
            <div className={styles.acoes}>
              <Button variant="secundario" onClick={descartar}>
                Descartar
              </Button>
              <Button type="submit" disabled={salvando}>
                {salvando ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
