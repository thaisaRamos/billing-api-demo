import { NextRequest, NextResponse } from 'next/server';
import { createRecurringBilling } from '@/lib/hitpay';
import type { Environment, RecurringBillingRequest } from '@/lib/hitpay';
import type { ApiKeyRegion } from '@/lib/payment-methods';

const API_KEYS: Record<ApiKeyRegion, { sandbox?: string; production?: string }> = {
  SG: { sandbox: process.env.HITPAY_API_KEY_SG, production: process.env.HITPAY_API_KEY_SG_PRODUCTION },
  MY: { sandbox: process.env.HITPAY_API_KEY_MY, production: process.env.HITPAY_API_KEY_MY_PRODUCTION },
  PH: { sandbox: process.env.HITPAY_API_KEY_PH, production: process.env.HITPAY_API_KEY_PH_PRODUCTION },
  TH: { sandbox: process.env.HITPAY_API_KEY_TH, production: process.env.HITPAY_API_KEY_TH_PRODUCTION },
};

interface RouteRequestBody {
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
  environment?: Environment;
}

export async function POST(req: NextRequest) {
  const body: RouteRequestBody = await req.json();

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
    environment,
  } = body;

  const apiKey = API_KEYS[api_key_region]?.[environment || 'sandbox'];
  if (!apiKey) {
    return NextResponse.json(
      { message: `API key not configured for region: ${api_key_region} (${environment || 'sandbox'})` },
      { status: 500 }
    );
  }

  const resolvedEnv: Environment =
    environment ?? (process.env.HITPAY_ENV === 'production' ? 'production' : 'sandbox');

  const request: RecurringBillingRequest = {
    customer_email,
    customer_name,
    amount,
    currency,
    name: billing_name,
    payment_method,
    generate_param,
    redirect_url,
    cancel_url,
    customer_phone_number,
    customer_phone_number_country_code,
  };

  try {
    const result = await createRecurringBilling(request, apiKey, resolvedEnv);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ message }, { status: 400 });
  }
}
