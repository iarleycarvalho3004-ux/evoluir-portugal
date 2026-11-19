import styles from './ChoiceGroup.module.css';

export type Choice<T extends string> = { value: T; label: string; description?: string };

type ChoiceGroupProps<T extends string> = {
  name: string;
  legend: string;
  options: Choice<T>[];
  value: T | '';
  onChange: (valor: T | '') => void;
  /** Quando informado, adiciona uma opção vazia, como "Prefiro não informar". */
  emptyLabel?: string;
  /** Texto mostrado quando nenhuma opção com descrição está escolhida. */
  emptyDescription?: string;
  hint?: string;
  error?: string;
};

export function ChoiceGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  emptyLabel,
  emptyDescription,
  hint,
  error,
}: ChoiceGroupProps<T>) {
  const todas: Choice<T | ''>[] = emptyLabel ? [{ value: '', label: emptyLabel }, ...options] : options;
  const escolhida = options.find((opcao) => opcao.value === value);
  const descricao = escolhida ? escolhida.description : emptyDescription;

  return (
    <fieldset className={styles.grupo}>
      <legend className={styles.legenda}>{legend}</legend>
      <div className={styles.chips}>
        {todas.map((opcao) => (
          <label key={opcao.value || 'vazio'} className={styles.chip}>
            <input
              type="radio"
              className={styles.entrada}
              name={name}
              value={opcao.value}
              checked={value === opcao.value}
              onChange={() => onChange(opcao.value)}
            />
            <span className={styles.rotulo}>{opcao.label}</span>
          </label>
        ))}
      </div>
      {descricao ? (
        <p className={styles.descricao} aria-live="polite">
          {descricao}
        </p>
      ) : null}
      {hint ? <p className={styles.ajuda}>{hint}</p> : null}
      {error ? <p className={styles.erro}>{error}</p> : null}
    </fieldset>
  );
}
