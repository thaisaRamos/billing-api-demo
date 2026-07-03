import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CheckoutSection from '@/components/CheckoutSection';
import type { Plan } from '@/lib/plans';
import type { Environment } from '@/lib/hitpay';

const proPlan: Plan = {
  id: 'pro',
  name: 'Pro',
  tagline: 'For teams',
  basePriceSGD: 29,
  features: [],
  highlighted: true,
};

const defaultProps = {
  plan: proPlan,
  currency: 'SGD' as const,
  environment: 'sandbox' as Environment,
  onSuccess: vi.fn(),
  onError: vi.fn(),
};

describe('CheckoutSection', () => {
  it('renders the selected plan name', () => {
    render(<CheckoutSection {...defaultProps} />);
    expect(screen.getByText(/Pro/)).toBeInTheDocument();
  });

  it('renders customer email field', () => {
    render(<CheckoutSection {...defaultProps} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders payment method options for SGD', () => {
    render(<CheckoutSection {...defaultProps} currency="SGD" />);
    expect(screen.getByText('Shopee Pay')).toBeInTheDocument();
    expect(screen.getByText('GrabPay')).toBeInTheDocument();
    expect(screen.getByText('GIRO')).toBeInTheDocument();
  });

  it('renders only ZaloPay for VND', () => {
    render(<CheckoutSection {...defaultProps} currency="VND" />);
    expect(screen.getByText('ZaloPay')).toBeInTheDocument();
    expect(screen.queryByText('Shopee Pay')).not.toBeInTheDocument();
  });

  it('shows phone number field when Shopee Pay is selected', () => {
    render(<CheckoutSection {...defaultProps} currency="SGD" />);
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
  });

  it('hides phone number field when GrabPay is selected', () => {
    render(<CheckoutSection {...defaultProps} currency="SGD" />);
    fireEvent.click(screen.getByText('GrabPay'));
    expect(screen.queryByLabelText(/phone/i)).not.toBeInTheDocument();
  });
});
