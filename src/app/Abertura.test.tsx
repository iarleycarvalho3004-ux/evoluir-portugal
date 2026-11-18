import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Abertura, DURACAO_MS, SAIDA_MS } from './Abertura';

beforeEach(() => {
  window.sessionStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Abertura', () => {
  it('aparece e some sozinha ao fim da duração', () => {
    render(<Abertura />);
    expect(screen.getByTestId('abertura')).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(DURACAO_MS);
    });
    act(() => {
      vi.advanceTimersByTime(SAIDA_MS + 50);
    });
    expect(screen.queryByTestId('abertura')).toBeNull();
  });

  it('não se repete na mesma sessão', () => {
    render(<Abertura />);
    cleanup();
    render(<Abertura />);
    expect(screen.queryByTestId('abertura')).toBeNull();
  });

  it('pode ser pulada com um toque', () => {
    render(<Abertura />);
    fireEvent.click(screen.getByTestId('abertura'));
    act(() => {
      vi.advanceTimersByTime(SAIDA_MS + 50);
    });
    expect(screen.queryByTestId('abertura')).toBeNull();
  });
});
