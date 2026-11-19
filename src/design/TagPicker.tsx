import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from './Button';
import styles from './TagPicker.module.css';

type TagPickerProps = {
  id: string;
  legend: string;
  hint?: string;
  error?: string;
  suggestions: string[];
  value: string[];
  onChange: (valor: string[]) => void;
  maxItems?: number;
};

const igual = (a: string, b: string) => a.toLocaleLowerCase('pt-BR') === b.toLocaleLowerCase('pt-BR');

export function TagPicker({ id, legend, hint, error, suggestions, value, onChange, maxItems = 30 }: TagPickerProps) {
  const [texto, setTexto] = useState('');
  const [aviso, setAviso] = useState('');

  const personalizadas = value.filter((item) => !suggestions.some((sugestao) => igual(sugestao, item)));
  const opcoes = [...suggestions, ...personalizadas];

  function alternar(item: string) {
    const existe = value.some((atual) => igual(atual, item));
    onChange(existe ? value.filter((atual) => !igual(atual, item)) : [...value, item]);
  }

  function adicionar() {
    const limpo = texto.trim();
    if (limpo.length < 2) {
      setAviso('Digite pelo menos 2 letras.');
      return;
    }
    if (limpo.length > 60) {
      setAviso('Use até 60 caracteres.');
      return;
    }
    if (!value.some((atual) => igual(atual, limpo))) {
      if (value.length >= maxItems) {
        setAviso(`Use no máximo ${maxItems} itens.`);
        return;
      }
      onChange([...value, limpo]);
    }
    setTexto('');
    setAviso('');
  }

  function aoTeclar(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      adicionar();
    }
  }

  return (
    <fieldset className={styles.grupo}>
      <legend className={styles.legenda}>{legend}</legend>
      <div className={styles.chips}>
        {opcoes.map((opcao) => (
          <label key={opcao} className={styles.chip}>
            <input
              type="checkbox"
              className={styles.entrada}
              checked={value.some((atual) => igual(atual, opcao))}
              onChange={() => alternar(opcao)}
            />
            <span className={styles.rotulo}>{opcao}</span>
          </label>
        ))}
      </div>
      <div className={styles.adicionar}>
        <input
          id={`${id}-nova`}
          className={styles.campo}
          type="text"
          value={texto}
          placeholder="Outra restrição"
          aria-label="Outra restrição"
          onChange={(e) => {
            setTexto(e.target.value);
            setAviso('');
          }}
          onKeyDown={aoTeclar}
        />
        <Button variant="secundario" onClick={adicionar}>
          Adicionar
        </Button>
      </div>
      {aviso ? <p className={styles.erro}>{aviso}</p> : null}
      {hint ? <p className={styles.ajuda}>{hint}</p> : null}
      {error ? <p className={styles.erro}>{error}</p> : null}
    </fieldset>
  );
}
