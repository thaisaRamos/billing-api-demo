'use client';

import { useState, useEffect } from 'react';
import type { Currency } from '@/lib/plans';
import { getPaymentMethods, PHONE_COUNTRY_CODES } from '@/lib/payment-methods';
import type { PaymentMethodOption } from '@/lib/payment-methods';
import PaymentMethodCard from '@/components/PaymentMethodCard';
import type { RecurringBillingResponse, Environment } from '@/lib/hitpay';

const METHOD_DESCRIPTIONS: Record<string, string> = {
  shopee_pay: "After submission, you'll be guided through completing the next steps with Shopee Pay.",
  grabpay_direct: "After submission, you'll be guided through completing the next steps with GrabPay.",
  touch_n_go: "After submission, you'll be guided through completing the next steps with Touch 'N Go.",
  zalopay: "A QR code will be displayed for the customer to scan with their ZaloPay app.",
  line_pay: "After submission, you'll be guided through completing the next steps with LINE Pay.",
};

// Nominal amount per currency — not charged now, used for method verification
const ACTIVATION_AMOUNTS: Record<Currency, string> = {
  SGD: '1.00',
  MYR: '3.45',
  PHP: '43.00',
  VND: '17500',
  THB: '26.00',
};

interface StartupSectionProps {
  currency: Currency;
  environment: Environment;
  onCurrencyChange: (currency: Currency) => void;
  onSuccess: (result: RecurringBillingResponse) => void;
  onError: (message: string) => void;
}

export default function StartupSection({
  currency,
  environment,
  onCurrencyChange,
  onSuccess,
  onError,
}: StartupSectionProps) {
  const methods = getPaymentMethods(currency);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodOption>(methods[0]);
  const [customerEmail, setCustomerEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedMethod(getPaymentMethods(currency)[0]);
  }, [currency]);

  const phoneCountryCode = PHONE_COUNTRY_CODES[currency];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const body: Record<string, string> = {
        customer_email: customerEmail,
        amount: ACTIVATION_AMOUNTS[currency],
        currency: currency.toLowerCase(),
        billing_name: 'NovaSend Messaging',
        payment_method: selectedMethod.id,
        generate_param: selectedMethod.generateParam,
        api_key_region: selectedMethod.apiKeyRegion,
        environment,
      };

      if (companyName) body.customer_name = companyName;
      if (selectedMethod.requiresRedirectUrl) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        body.redirect_url = origin;
        body.cancel_url = `${origin}/api-platform/cancelled`;
      }
      if (selectedMethod.requiresPhone && phoneNumber && phoneCountryCode) {
        body.customer_phone_number = phoneNumber;
        body.customer_phone_number_country_code = phoneCountryCode;
      }

      const res = await fetch('/api/recurring-billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        onError(data.message || 'Something went wrong');
        return;
      }

      // For redirect payments (direct_link), save state and let HitPay handle the redirect
      if (data.direct_link?.direct_link_url) {
        sessionStorage.setItem('hp_api_platform_checkout_state', JSON.stringify({
          currency,
          environment,
          customerEmail: customerEmail,
          amount: ACTIVATION_AMOUNTS[currency],
        }));
        window.location.href = data.direct_link.direct_link_url;
        return;
      }

      onSuccess(data);
    } catch {
      onError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 text-center bg-gradient-to-br from-white to-gray-50 border-b border-gray-200">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Messaging API
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Send messages at scale with NovaSend
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            SMS, WhatsApp, and voice — one API to reach your users anywhere. No charge today, billed per message at month end.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Free to start
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Pay per message
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              99.9% uptime SLA
            </span>
          </div>
        </div>
      </section>

      {/* Account activation form */}
      <section className="py-10 px-6">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-semibold text-gray-900">Activate your NovaSend account</h2>
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as Currency)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="SGD">SGD</option>
                <option value="MYR">MYR</option>
                <option value="PHP">PHP</option>
                <option value="VND">VND</option>
                <option value="THB">THB</option>
              </select>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Add a payment method to start sending. You&apos;ll only be charged for messages you send.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Company <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Inc."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label htmlFor="billing-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="billing-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Payment method</h3>
                <div className="flex flex-row gap-3 flex-wrap">
                  {methods.map((method) => (
                    <PaymentMethodCard
                      key={method.id}
                      method={method}
                      selected={selectedMethod.id === method.id}
                      onSelect={setSelectedMethod}
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600">
                  <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>{METHOD_DESCRIPTIONS[selectedMethod.id]}</span>
                </div>
              </div>

              {selectedMethod.requiresPhone && (
                <div>
                  <label htmlFor="startup-phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-gray-100 border border-gray-300 rounded-l-lg text-sm text-gray-600 border-r-0">
                      +{phoneCountryCode}
                    </span>
                    <input
                      id="startup-phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="81234567"
                      required
                      className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-colors cursor-pointer text-base sm:text-lg shadow-md hover:shadow-lg"
              >
                {loading ? 'Activating...' : `Activate with ${selectedMethod.name}`}
              </button>
              <p className="text-xs text-center text-gray-400 -mt-2">
                No charge today. You&apos;ll be billed per message at the end of each month.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
