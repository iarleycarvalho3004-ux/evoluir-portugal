import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ChoiceGroup, TagPicker } from './index';

afterEach(cleanup);

function Escolha() {
  const [valor, setValor] = useState<'' | 'a' | 'b'>('');
  return (
    <ChoiceGroup
      name="teste"
      legend="Escolha"
      options={[
        { value: 'a', label: 'A', description: 'Descrição de A' },
        { value: 'b', label: 'B' },
      ]}
      value={valor}
      onChange={setValor}
      emptyLabel="Nenhum"
      emptyDescription="Toque para ver"
    />
  );
}

function Etiquetas() {
  const [valor, setValor] = useState<string[]>([]);
  return <TagPicker id="t" legend="Restrições" suggestions={['Lactose', 'Glúten']} value={valor} onChange={setValor} />;
}

describe('ChoiceGroup', () => {
  it('mostra a descrição da opção escolhida e volta ao texto inicial', () => {
    render(<Escolha />);
    expect(screen.getByText('Toque para ver')).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: 'A' }));
    expect(screen.getByText('Descrição de A')).toBeTruthy();
    expect((screen.getByRole('radio', { name: 'A' }) as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByRole('radio', { name: 'Nenhum' }));
    expect(screen.getByText('Toque para ver')).toBeTruthy();
  });
});

describe('TagPicker', () => {
  it('marca e desmarca sugestões', () => {
    render(<Etiquetas />);
    const lactose = screen.getByRole('checkbox', { name: 'Lactose' }) as HTMLInputElement;
    fireEvent.click(lactose);
    expect(lactose.checked).toBe(true);
    fireEvent.click(lactose);
    expect(lactose.checked).toBe(false);
  });

  it('adiciona uma restrição própria sem duplicar', () => {
    render(<Etiquetas />);
    const campo = screen.getByLabelText('Outra restrição');
    fireEvent.change(campo, { target: { value: 'Mel' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect((screen.getByRole('checkbox', { name: 'Mel' }) as HTMLInputElement).checked).toBe(true);
    fireEvent.change(screen.getByLabelText('Outra restrição'), { target: { value: 'mel' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(screen.getAllByRole('checkbox', { name: /^mel$/i })).toHaveLength(1);
  });

  it('recusa texto curto demais', () => {
    render(<Etiquetas />);
    fireEvent.change(screen.getByLabelText('Outra restrição'), { target: { value: 'a' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(screen.getByText('Digite pelo menos 2 letras.')).toBeTruthy();
  });
});
