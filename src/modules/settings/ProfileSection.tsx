import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { descreverErroDeArmazenamento } from '../../core/db/erros';
import { apagarPerfil, lerPerfil, salvarPerfil } from '../../core/db/repositorios';
import type { Profile } from '../../core/db/types';
import { Alerta, Button, Card, Field } from '../../design';
import { formularioDoPerfil, formularioVazio, lerFormulario } from './perfilForm';
import type { ErrosFormulario, PerfilFormulario } from './perfilForm';
import styles from './ProfileSection.module.css';

type Carga = 'carregando' | 'pronto' | 'erro';
type Mensagem = { tipo: 'ok' | 'erro'; texto: string };

export function ProfileSection() {
  const [carga, setCarga] = useState<Carga>('carregando');
  const [erroDeCarga, setErroDeCarga] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [perfilSalvo, setPerfilSalvo] = useState<Profile | null>(null);
  const [formulario, setFormulario] = useState<PerfilFormulario>({ ...formularioVazio });
  const [erros, setErros] = useState<ErrosFormulario>({});
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmandoApagar, setConfirmandoApagar] = useState(false);

  useEffect(() => {
    let ativo = true;
    setCarga('carregando');
    lerPerfil()
      .then((perfil) => {
        if (!ativo) return;
        setPerfilSalvo(perfil);
        setFormulario(formularioDoPerfil(perfil));
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

  function atualizar<K extends keyof PerfilFormulario>(campo: K, valor: PerfilFormulario[K]) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
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
      setFormulario({ ...formularioVazio });
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
      <Card>
        <h2 className={styles.titulo}>Perfil</h2>
        <Alerta tone="aviso" title="Não foi possível abrir o perfil">
          {erroDeCarga}
        </Alerta>
        <div className={styles.acoes}>
          <Button variant="secundario" onClick={() => setTentativa((n) => n + 1)}>
            Tentar novamente
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className={styles.titulo}>Perfil</h2>
      <p className={styles.texto}>
        Todos os campos são opcionais. Os dados ficam só neste aparelho e não são enviados a nenhum serviço.
      </p>
      <form className={styles.formulario} onSubmit={aoSalvar} noValidate>
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
          id="nascimento"
          label="Data de nascimento"
          hint="Para estimar o gasto calórico. Se preferir, informe só a idade aproximada abaixo."
          error={erros.nascimento}
        >
          {(c) => (
            <input {...c} type="date" value={formulario.nascimento} onChange={(e) => atualizar('nascimento', e.target.value)} />
          )}
        </Field>
        <Field
          id="idade"
          label="Idade aproximada"
          hint="Alternativa à data de nascimento. Sem nenhuma das duas, o app usa uma estimativa genérica ou pede a meta de calorias manualmente."
          error={erros.idadeAprox}
        >
          {(c) => (
            <input {...c} type="text" inputMode="numeric" value={formulario.idadeAprox} onChange={(e) => atualizar('idadeAprox', e.target.value)} />
          )}
        </Field>
        <Field
          id="sexo"
          label="Sexo"
          hint="Usado só na fórmula de gasto calórico. Pode deixar em branco."
          error={erros.sexo}
        >
          {(c) => (
            <select {...c} value={formulario.sexo} onChange={(e) => atualizar('sexo', e.target.value as PerfilFormulario['sexo'])}>
              <option value="">Prefiro não informar</option>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
            </select>
          )}
        </Field>
        <Field id="objetivo" label="Objetivo" hint="Para orientar sugestões de treino e alimentação." error={erros.objetivo}>
          {(c) => (
            <select {...c} value={formulario.objetivo} onChange={(e) => atualizar('objetivo', e.target.value as PerfilFormulario['objetivo'])}>
              <option value="">Não definido</option>
              <option value="hypertrophy">Hipertrofia</option>
              <option value="fat-loss">Emagrecimento</option>
              <option value="recomposition">Recomposição corporal</option>
              <option value="maintenance">Manutenção</option>
            </select>
          )}
        </Field>
        <Field id="meta-peso" label="Meta de peso (kg)" hint="Para mostrar seu progresso até a meta." error={erros.metaPeso}>
          {(c) => (
            <input {...c} type="text" inputMode="decimal" value={formulario.metaPeso} onChange={(e) => atualizar('metaPeso', e.target.value)} />
          )}
        </Field>
        <Field
          id="restricoes"
          label="Restrições alimentares"
          hint="Para filtrar sugestões e substituições de alimentos. Separe por vírgula. Sem isso, nada é filtrado."
          error={erros.restricoes}
        >
          {(c) => (
            <input {...c} type="text" value={formulario.restricoes} onChange={(e) => atualizar('restricoes', e.target.value)} />
          )}
        </Field>

        {mensagem ? (
          <p className={mensagem.tipo === 'ok' ? styles.sucesso : styles.erro} role="status">
            {mensagem.texto}
          </p>
        ) : null}

        <div className={styles.acoes}>
          <Button type="submit" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar perfil'}
          </Button>
        </div>
      </form>

      {perfilSalvo ? (
        <div className={styles.apagar}>
          {confirmandoApagar ? (
            <>
              <p className={styles.texto}>Apagar o perfil deste aparelho? Isso não pode ser desfeito.</p>
              <div className={styles.acoes}>
                <Button variant="perigo" onClick={aoApagar}>
                  Confirmar exclusão
                </Button>
                <Button variant="secundario" onClick={() => setConfirmandoApagar(false)}>
                  Cancelar
                </Button>
              </div>
            </>
          ) : (
            <Button variant="secundario" onClick={() => setConfirmandoApagar(true)}>
              Apagar perfil
            </Button>
          )}
        </div>
      ) : null}
    </Card>
  );
}
