import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResultCard from '@/components/ResultCard';
import type { RecurringBillingResponse } from '@/lib/hitpay';

const baseResponse: RecurringBillingResponse = {
  id: 'resp-123',
  status: 'scheduled',
  currency: 'sgd',
  amount: 29,
  customer_name: 'Jane Doe',
  customer_email: 'jane@example.com',
  name: 'Pro Plan',
  payment_methods: ['shopee_pay'],
  created_at: '2026-05-08T10:00:00Z',
};

describe('ResultCard', () => {
  it('renders a QR image for qr_code_data response', () => {
    const response = {
      ...baseResponse,
      payment_methods: ['zalopay'],
      qr_code_data: {
        qr_code: 'data:image/png;base64,abc123',
        qr_code_expiry: '2026-05-08T11:00:00Z',
      },
    };
    render(<ResultCard response={response} onReset={() => {}} />);
    expect(screen.getByRole('img', { name: /ZaloPay QR code/i })).toBeInTheDocument();
  });

  it('renders steps for instructions response', () => {
    const response = {
      ...baseResponse,
      payment_methods: ['giro'],
      instructions: {
        reference: 'REF12345',
        steps: ['Log in to your bank', 'Add a new payee'],
      },
    };
    render(<ResultCard response={response} onReset={() => {}} />);
    expect(screen.getByText('Log in to your bank')).toBeInTheDocument();
    expect(screen.getByText('Add a new payee')).toBeInTheDocument();
  });

  it('renders a "Start over" button', () => {
    const response = {
      ...baseResponse,
      payment_methods: ['zalopay'],
      qr_code_data: {
        qr_code: 'data:image/png;base64,abc123',
        qr_code_expiry: '2026-05-08T11:00:00Z',
      },
    };
    render(<ResultCard response={response} onReset={() => {}} />);
    expect(screen.getByRole('button', { name: /start over/i })).toBeInTheDocument();
  });
});
