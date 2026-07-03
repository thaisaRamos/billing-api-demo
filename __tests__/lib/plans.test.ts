import { describe, it, expect } from 'vitest';
import {
  PLANS,
  convertPrice,
  formatPrice,
  formatAmountForApi,
  FX_RATES,
  CURRENCY_SYMBOLS,
} from '@/lib/plans';
import type { Currency } from '@/lib/plans';

describe('PLANS', () => {
  it('has 3 plans', () => {
    expect(PLANS).toHaveLength(3);
  });

  it('has Starter, Pro, Business', () => {
    expect(PLANS.map((p) => p.id)).toEqual(['starter', 'pro', 'business']);
  });
});

describe('convertPrice', () => {
  it('SGD stays the same', () => {
    expect(convertPrice(9, 'SGD')).toBe(9);
  });

  it('converts SGD to MYR', () => {
    expect(convertPrice(9, 'MYR')).toBe(31.05);
  });

  it('converts SGD to PHP as integer', () => {
    expect(convertPrice(9, 'PHP')).toBe(387);
  });

  it('converts SGD to VND rounded to nearest 500', () => {
    expect(convertPrice(9, 'VND')).toBe(157500);
  });
});

describe('formatPrice', () => {
  it('formats SGD', () => {
    expect(formatPrice(9, 'SGD')).toBe('S$9.00');
  });

  it('formats MYR', () => {
    expect(formatPrice(9, 'MYR')).toBe('RM31.05');
  });

  it('formats PHP', () => {
    expect(formatPrice(9, 'PHP')).toBe('₱387');
  });

  it('formats VND without decimals', () => {
    expect(formatPrice(9, 'VND')).toBe('₫157,500');
  });
});

describe('formatAmountForApi', () => {
  it('formats SGD with 2 decimal places', () => {
    expect(formatAmountForApi(9, 'SGD')).toBe('9.00');
  });

  it('formats VND as integer string', () => {
    expect(formatAmountForApi(9, 'VND')).toBe('157500');
  });

  it('formats PHP as integer string', () => {
    expect(formatAmountForApi(9, 'PHP')).toBe('387');
  });
});
