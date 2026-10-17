import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import GuessInput from './GuessInput';

describe('GuessInput', () => {
  it('sugere carros enquanto digita e envia a escolha', () => {
    const onSubmit = vi.fn();
    render(<GuessInput disabled={false} onSubmit={onSubmit} />);

    const input = screen.getByLabelText('Seu chute');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'porsche' } });

    const suggestion = screen.getByRole('button', { name: 'Porsche 911' });
    fireEvent.mouseDown(suggestion);
    fireEvent.click(suggestion);

    expect(onSubmit).toHaveBeenCalledWith('Porsche 911');
    expect(input.value).toBe('');
  });

  it('envia o texto digitado pelo formulário', () => {
    const onSubmit = vi.fn();
    const { container } = render(<GuessInput disabled={false} onSubmit={onSubmit} />);

    const input = screen.getByLabelText('Seu chute');
    fireEvent.change(input, { target: { value: 'Ford Mustang' } });
    fireEvent.submit(container.querySelector('form'));

    expect(onSubmit).toHaveBeenCalledWith('Ford Mustang');
  });

  it('fica desabilitado quando a rodada terminou', () => {
    render(<GuessInput disabled onSubmit={() => {}} />);
    expect(screen.getByLabelText('Seu chute').disabled).toBe(true);
  });
});
