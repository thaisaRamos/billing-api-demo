import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/Header';
import type { Currency } from '@/lib/plans';
import type { Environment } from '@/lib/hitpay';

describe('Header', () => {
  const defaultProps = {
    currency: 'SGD' as Currency,
    onCurrencyChange: vi.fn(),
    environment: 'sandbox' as Environment,
    onEnvironmentChange: vi.fn(),
  };

  it('renders the HitPay logo text', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('HitPay')).toBeInTheDocument();
  });

  it('shows current currency in the selector', () => {
    render(<Header {...defaultProps} />);
    const select = screen.getByRole('combobox');
    expect((select as HTMLSelectElement).value).toBe('SGD');
  });

  it('calls onCurrencyChange when currency is changed', () => {
    const onCurrencyChange = vi.fn();
    render(<Header {...defaultProps} onCurrencyChange={onCurrencyChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'MYR' } });
    expect(onCurrencyChange).toHaveBeenCalledWith('MYR');
  });

  it('shows Sandbox badge when environment is sandbox', () => {
    render(<Header {...defaultProps} environment="sandbox" />);
    expect(screen.getByText('Sandbox')).toBeInTheDocument();
  });

  it('shows Production badge when environment is production', () => {
    render(<Header {...defaultProps} environment="production" />);
    expect(screen.getByText('Production')).toBeInTheDocument();
  });

  it('calls onEnvironmentChange when toggle is clicked', () => {
    const onEnvironmentChange = vi.fn();
    render(<Header {...defaultProps} onEnvironmentChange={onEnvironmentChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onEnvironmentChange).toHaveBeenCalled();
  });
});
