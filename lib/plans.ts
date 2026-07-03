export type Currency = 'SGD' | 'MYR' | 'PHP' | 'VND' | 'THB';

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  basePriceSGD: number;
  features: string[];
  highlighted: boolean;
}

export const FX_RATES: Record<Currency, number> = {
  SGD: 1,
  MYR: 3.45,
  PHP: 43,
  VND: 17500,
  THB: 26,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  SGD: 'S$',
  MYR: 'RM',
  PHP: '₱',
  VND: '₫',
  THB: '฿',
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  SGD: 'SGD – Singapore Dollar',
  MYR: 'MYR – Malaysian Ringgit',
  PHP: 'PHP – Philippine Peso',
  VND: 'VND – Vietnamese Dong',
  THB: 'THB – Thai Baht',
};

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For individuals getting started',
    basePriceSGD: 9,
    features: ['Up to 100 transactions/mo', 'Email support', 'Basic analytics'],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For growing businesses',
    basePriceSGD: 29,
    features: ['Unlimited transactions', 'Priority support', 'Advanced analytics', 'Webhooks'],
    highlighted: true,
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'For enterprises at scale',
    basePriceSGD: 79,
    features: ['Everything in Pro', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee'],
    highlighted: false,
  },
];

export function convertPrice(basePriceSGD: number, currency: Currency): number {
  const converted = basePriceSGD * FX_RATES[currency];
  if (currency === 'VND') return Math.round(converted / 500) * 500;
  if (currency === 'PHP') return Math.round(converted);
  return Math.round(converted * 100) / 100;
}

export function formatPrice(basePriceSGD: number, currency: Currency): string {
  const amount = convertPrice(basePriceSGD, currency);
  const symbol = CURRENCY_SYMBOLS[currency];
  if (currency === 'VND') return `${symbol}${amount.toLocaleString('en-US')}`;
  if (currency === 'PHP') return `${symbol}${amount}`;
  return `${symbol}${amount.toFixed(2)}`;
}

export function formatAmountForApi(basePriceSGD: number, currency: Currency): string {
  const amount = convertPrice(basePriceSGD, currency);
  if (currency === 'VND' || currency === 'PHP') return String(Math.round(amount));
  return amount.toFixed(2);
}
