import { NextRequest, NextResponse } from 'next/server';
import type { ApiKeyRegion } from '@/lib/payment-methods';

const API_KEYS: Record<ApiKeyRegion, { sandbox?: string; production?: string }> = {
  SG: { sandbox: process.env.HITPAY_API_KEY_SG, production: process.env.HITPAY_API_KEY_SG_PRODUCTION },
  MY: { sandbox: process.env.HITPAY_API_KEY_MY, production: process.env.HITPAY_API_KEY_MY_PRODUCTION },
  PH: { sandbox: process.env.HITPAY_API_KEY_PH, production: process.env.HITPAY_API_KEY_PH_PRODUCTION },
  TH: { sandbox: process.env.HITPAY_API_KEY_TH, production: process.env.HITPAY_API_KEY_TH_PRODUCTION },
};

interface EmbeddedRecurringBillingRequest {
  customer_email: string;
  customer_name?: string;
  amount: string;
  currency: string;
  billing_name: string;
  payment_method: string;
  generate_param: 'generate_qr' | 'generate_direct_link' | 'generate_instructions';
  api_key_region: ApiKeyRegion;
  redirect_url?: string;
  cancel_url?: string;
  customer_phone_number?: string;
  customer_phone_number_country_code?: string;
}

export async function POST(req: NextRequest) {
  const body: EmbeddedRecurringBillingRequest = await req.json();

  const {
    customer_email,
    customer_name,
    amount,
    currency,
    billing_name,
    payment_method,
    generate_param,
    api_key_region,
    redirect_url,
    cancel_url,
    customer_phone_number,
    customer_phone_number_country_code,
  } = body;

  const apiKey = API_KEYS[api_key_region]?.sandbox;
  if (!apiKey) {
    return NextResponse.json(
      { message: `API key not configured for region: ${api_key_region}` },
      { status: 500 }
    );
  }

  try {
    const formData = new URLSearchParams();
    formData.append('customer_email', customer_email);
    if (customer_name) formData.append('customer_name', customer_name);
    formData.append('amount', amount);
    formData.append('currency', currency);
    formData.append('name', billing_name);
    formData.append('payment_methods[]', payment_method);
    formData.append('save_payment_method', 'true');
    formData.append(generate_param, '1');
    if (redirect_url) formData.append('redirect_url', redirect_url);
    if (cancel_url) formData.append('cancel_url', cancel_url);
    if (customer_phone_number) formData.append('customer_phone_number', customer_phone_number);
    if (customer_phone_number_country_code) {
      formData.append('customer_phone_number_country_code', customer_phone_number_country_code);
    }

    const response = await fetch('https://api.sandbox.hit-pay.com/v1/recurring-billing', {
      method: 'POST',
      headers: {
        'X-BUSINESS-API-KEY': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ message }, { status: 400 });
  }
}
