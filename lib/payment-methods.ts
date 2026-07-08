import type { Currency } from '@/lib/plans';

export type PaymentMethodId = 'zalopay' | 'shopee_pay' | 'grabpay_direct' | 'touch_n_go' | 'giro' | 'line_pay' | 'card';
export type GenerateParam = 'generate_qr' | 'generate_direct_link' | 'generate_instructions' | '';
export type CardPaymentType = 'card';
export type ApiKeyRegion = 'SG' | 'MY' | 'PH' | 'TH';
export type ResponseType = 'qr' | 'link' | 'instructions' | 'redirect' | 'save-payment';

export interface PaymentMethodOption {
  id: PaymentMethodId;
  name: string;
  generateParam: GenerateParam;
  apiKeyRegion: ApiKeyRegion;
  requiresRedirectUrl: boolean;
  requiresPhone: boolean;
  responseType: ResponseType;
  isHostedCheckout?: boolean;
}

const PAYMENT_METHODS_BY_CURRENCY: Record<Currency, PaymentMethodOption[]> = {
  SGD: [
    {
      id: 'card',
      name: 'Card',
      generateParam: '',
      apiKeyRegion: 'SG',
      requiresRedirectUrl: true,
      requiresPhone: false,
      responseType: 'redirect',
      isHostedCheckout: true,
    },
    {
      id: 'shopee_pay',
      name: 'Shopee Pay',
      generateParam: 'generate_direct_link',
      apiKeyRegion: 'SG',
      requiresRedirectUrl: true,
      requiresPhone: true,
      responseType: 'link',
    },
    {
      id: 'grabpay_direct',
      name: 'GrabPay',
      generateParam: 'generate_direct_link',
      apiKeyRegion: 'SG',
      requiresRedirectUrl: true,
      requiresPhone: false,
      responseType: 'link',
    },
  ],
  MYR: [
    {
      id: 'card',
      name: 'Card',
      generateParam: '',
      apiKeyRegion: 'MY',
      requiresRedirectUrl: true,
      requiresPhone: false,
      responseType: 'redirect',
      isHostedCheckout: true,
    },
    {
      id: 'shopee_pay',
      name: 'Shopee Pay',
      generateParam: 'generate_direct_link',
      apiKeyRegion: 'MY',
      requiresRedirectUrl: true,
      requiresPhone: true,
      responseType: 'link',
    },
    {
      id: 'grabpay_direct',
      name: 'GrabPay',
      generateParam: 'generate_direct_link',
      apiKeyRegion: 'MY',
      requiresRedirectUrl: true,
      requiresPhone: false,
      responseType: 'link',
    },
    {
      id: 'touch_n_go',
      name: "Touch 'N Go",
      generateParam: 'generate_direct_link',
      apiKeyRegion: 'MY',
      requiresRedirectUrl: true,
      requiresPhone: false,
      responseType: 'link',
    },
  ],
  PHP: [
    {
      id: 'card',
      name: 'Card',
      generateParam: '',
      apiKeyRegion: 'PH',
      requiresRedirectUrl: true,
      requiresPhone: false,
      responseType: 'redirect',
      isHostedCheckout: true,
    },
    {
      id: 'shopee_pay',
      name: 'Shopee Pay',
      generateParam: 'generate_direct_link',
      apiKeyRegion: 'PH',
      requiresRedirectUrl: true,
      requiresPhone: true,
      responseType: 'link',
    },
  ],
  VND: [
    {
      id: 'card',
      name: 'Card',
      generateParam: '',
      apiKeyRegion: 'SG',
      requiresRedirectUrl: true,
      requiresPhone: false,
      responseType: 'redirect',
      isHostedCheckout: true,
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      generateParam: 'generate_qr',
      apiKeyRegion: 'SG',
      requiresRedirectUrl: true,
      requiresPhone: false,
      responseType: 'qr',
    },
  ],
  THB: [
    {
      id: 'card',
      name: 'Card',
      generateParam: '',
      apiKeyRegion: 'SG',
      requiresRedirectUrl: true,
      requiresPhone: false,
      responseType: 'redirect',
      isHostedCheckout: true,
    },
    {
      id: 'line_pay',
      name: 'LinePay',
      generateParam: 'generate_direct_link',
      apiKeyRegion: 'SG',
      requiresRedirectUrl: true,
      requiresPhone: false,
      responseType: 'link',
    },
  ],
};

export function getPaymentMethods(currency: Currency): PaymentMethodOption[] {
  return PAYMENT_METHODS_BY_CURRENCY[currency];
}

export const PHONE_COUNTRY_CODES: Partial<Record<Currency, string>> = {
  SGD: '65',
  MYR: '60',
  PHP: '63',
};
