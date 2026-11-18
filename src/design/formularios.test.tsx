import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Alerta, Field, ProgressBar } from './index';

afterEach(cleanup);

describe('Field', () => {
  it('liga o rótulo ao controle e descreve ajuda e erro', () => {
    render(
      <Field id="altura" label="Altura (cm)" hint="Para calcular o IMC." error="Valor inválido.">
        {(controle) => <input {...controle} />}
      </Field>,
    );
    const campo = screen.getByLabelText('Altura (cm)');
    expect(campo.getAttribute('aria-invalid')).toBe('true');
    expect(campo.getAttribute('aria-describedby')).toBe('altura-ajuda altura-erro');
    expect(screen.getByText('Para calcular o IMC.')).toBeTruthy();
    expect(screen.getByText('Valor inválido.')).toBeTruthy();
  });

  it('não marca erro quando não há erro', () => {
    render(
      <Field id="peso" label="Peso">
        {(controle) => <input {...controle} />}
      </Field>,
    );
    const campo = screen.getByLabelText('Peso');
    expect(campo.getAttribute('aria-invalid')).toBe('false');
    expect(campo.getAttribute('aria-describedby')).toBeNull();
  });
});

describe('Alerta', () => {
  it('usa role alert só no nível crítico', () => {
    render(
      <Alerta tone="critico" title="Espaço crítico">
        Faça backup.
      </Alerta>,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    cleanup();
    render(
      <Alerta tone="aviso" title="Atenção">
        Texto.
      </Alerta>,
    );
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('status')).toBeTruthy();
  });
});

describe('ProgressBar com tom de alerta', () => {
  it('continua acessível', () => {
    render(<ProgressBar value={95} label="Espaço usado" tone="alerta" />);
    expect(screen.getByRole('progressbar', { name: 'Espaço usado' }).getAttribute('aria-valuenow')).toBe('95');
  });
});
