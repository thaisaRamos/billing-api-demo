import { describe, it, expect } from 'vitest';
import { getPaymentMethods, PHONE_COUNTRY_CODES } from '@/lib/payment-methods';

describe('getPaymentMethods', () => {
  it('SGD returns shopee_pay, grabpay_direct, giro', () => {
    const methods = getPaymentMethods('SGD');
    expect(methods.map((m) => m.id)).toEqual(['shopee_pay', 'grabpay_direct', 'giro']);
  });

  it('MYR returns shopee_pay, grabpay_direct, touch_n_go', () => {
    const methods = getPaymentMethods('MYR');
    expect(methods.map((m) => m.id)).toEqual(['shopee_pay', 'grabpay_direct', 'touch_n_go']);
  });

  it('PHP returns only shopee_pay', () => {
    const methods = getPaymentMethods('PHP');
    expect(methods.map((m) => m.id)).toEqual(['shopee_pay']);
  });

  it('VND returns only zalopay', () => {
    const methods = getPaymentMethods('VND');
    expect(methods.map((m) => m.id)).toEqual(['zalopay']);
  });

  it('ZaloPay uses SG api key (cross-border)', () => {
    const zalopay = getPaymentMethods('VND')[0];
    expect(zalopay.apiKeyRegion).toBe('SG');
  });

  it('SGD shopee_pay uses SG api key', () => {
    const shopee = getPaymentMethods('SGD').find((m) => m.id === 'shopee_pay')!;
    expect(shopee.apiKeyRegion).toBe('SG');
  });

  it('MYR shopee_pay uses MY api key', () => {
    const shopee = getPaymentMethods('MYR').find((m) => m.id === 'shopee_pay')!;
    expect(shopee.apiKeyRegion).toBe('MY');
  });

  it('touch_n_go uses MY api key', () => {
    const tng = getPaymentMethods('MYR').find((m) => m.id === 'touch_n_go')!;
    expect(tng.apiKeyRegion).toBe('MY');
  });

  it('shopee_pay requires redirect url', () => {
    const shopee = getPaymentMethods('SGD').find((m) => m.id === 'shopee_pay')!;
    expect(shopee.requiresRedirectUrl).toBe(true);
  });

  it('giro does not require redirect url', () => {
    const giro = getPaymentMethods('SGD').find((m) => m.id === 'giro')!;
    expect(giro.requiresRedirectUrl).toBe(false);
  });

  it('shopee_pay requires phone number', () => {
    const shopee = getPaymentMethods('SGD').find((m) => m.id === 'shopee_pay')!;
    expect(shopee.requiresPhone).toBe(true);
  });

  it('zalopay does not require phone number', () => {
    const zalopay = getPaymentMethods('VND')[0];
    expect(zalopay.requiresPhone).toBe(false);
  });
});

describe('PHONE_COUNTRY_CODES', () => {
  it('SGD maps to 65', () => {
    expect(PHONE_COUNTRY_CODES['SGD']).toBe('65');
  });

  it('MYR maps to 60', () => {
    expect(PHONE_COUNTRY_CODES['MYR']).toBe('60');
  });

  it('PHP maps to 63', () => {
    expect(PHONE_COUNTRY_CODES['PHP']).toBe('63');
  });
});
