export type Environment = 'sandbox' | 'production';

const BASE_URLS: Record<Environment, string> = {
  sandbox: 'https://api.sandbox.hit-pay.com',
  production: 'https://api.hit-pay.com',
};

export interface RecurringBillingRequest {
  customer_email: string;
  customer_name?: string;
  amount: string;
  currency: string;
  name: string;
  payment_method: string;
  generate_param: 'generate_qr' | 'generate_direct_link' | 'generate_instructions';
  redirect_url?: string;
  cancel_url?: string;
  customer_phone_number?: string;
  customer_phone_number_country_code?: string;
}

export interface QrCodeData {
  qr_code: string;
  qr_code_expiry: string;
}

export interface DirectLink {
  direct_link_url: string;
  direct_link_app_url: string | null;
  expiry_time: string | null;
}

export interface GiroInstructions {
  reference: string;
  steps: string[];
}

export interface RecurringBillingResponse {
  id: string;
  status: string;
  currency: string;
  amount: number;
  customer_name: string;
  customer_email: string;
  name: string;
  payment_methods: string[];
  created_at: string;
  // QR response
  qr_code_data?: QrCodeData;
  // Direct link response
  direct_link?: DirectLink;
  // Instructions response
  instructions?: GiroInstructions;
}

export async function createRecurringBilling(
  request: RecurringBillingRequest,
  apiKey: string,
  environment: Environment = 'sandbox'
): Promise<RecurringBillingResponse> {
  const baseUrl = BASE_URLS[environment];
  const body = new URLSearchParams();

  body.append('customer_email', request.customer_email);
  if (request.customer_name) body.append('customer_name', request.customer_name);
  body.append('amount', request.amount);
  body.append('currency', request.currency);
  body.append('name', request.name);
  body.append('payment_methods[]', request.payment_method);
  body.append('save_payment_method', 'true');
  body.append(request.generate_param, '1');
  if (request.redirect_url) body.append('redirect_url', request.redirect_url);
  if (request.cancel_url) body.append('cancel_url', request.cancel_url);
  if (request.customer_phone_number) body.append('customer_phone_number', request.customer_phone_number);
  if (request.customer_phone_number_country_code) {
    body.append('customer_phone_number_country_code', request.customer_phone_number_country_code);
  }

  const response = await fetch(`${baseUrl}/v1/recurring-billing`, {
    method: 'POST',
    headers: {
      'X-BUSINESS-API-KEY': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json() as Promise<RecurringBillingResponse>;
}
