'use client';

import { useState, useEffect } from 'react';
import type { Plan, Currency } from '@/lib/plans';
import { formatPrice, formatAmountForApi } from '@/lib/plans';
import { getPaymentMethods, PHONE_COUNTRY_CODES } from '@/lib/payment-methods';
import type { PaymentMethodOption } from '@/lib/payment-methods';
import PaymentMethodCard from '@/components/PaymentMethodCard';

const METHOD_DESCRIPTIONS: Record<string, string> = {
  card: "After submission, you'll be guided through completing the next steps with Cards.",
  shopee_pay: "After submission, you'll be guided through completing the next steps with Shopee Pay.",
  grabpay_direct: "After submission, you'll be guided through completing the next steps with GrabPay.",
  touch_n_go: "After submission, you'll be guided through completing the next steps with Touch 'N Go.",
  zalopay: "A QR code will be displayed for the customer to scan with their ZaloPay app.",
  line_pay: "After submission, you'll be guided through completing the next steps with LINE Pay.",
};

const CURRENCY_FLAGS: Record<string, string> = {
  SGD: '🇸🇬',
  MYR: '🇲🇾',
  PHP: '🇵🇭',
  VND: '🇻🇳',
  THB: '🇹🇭',
};

import type { RecurringBillingResponse } from '@/lib/hitpay';
import type { Environment } from '@/lib/hitpay';

interface CheckoutSectionProps {
  plan: Plan;
  currency: Currency;
  environment: Environment;
  onCurrencyChange: (currency: Currency) => void;
  onSuccess: (result: RecurringBillingResponse) => void;
  onError: (message: string) => void;
}

export default function CheckoutSection({
  plan,
  currency,
  environment,
  onCurrencyChange,
  onSuccess,
  onError,
}: CheckoutSectionProps) {
  const methods = getPaymentMethods(currency);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodOption>(methods[0]);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset method when currency changes
  useEffect(() => {
    setSelectedMethod(getPaymentMethods(currency)[0]);
  }, [currency]);

  const phoneCountryCode = PHONE_COUNTRY_CODES[currency];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const body: Record<string, string> = {
        customer_email: customerEmail,
        amount: formatAmountForApi(plan.basePriceSGD, currency),
        currency: currency.toLowerCase(),
        billing_name: `${plan.name} Plan`,
        payment_method: selectedMethod.id,
        generate_param: selectedMethod.generateParam,
        api_key_region: selectedMethod.apiKeyRegion,
      };

      if (selectedMethod.id !== 'card') {
        body.environment = environment as string;
      }

      // Add cycle information for recurring plans (cards only use this)
      if (selectedMethod.id === 'card') {
        body.cycle = 'monthly';
        body.cycle_frequency = 'month';
        // Start date is today (YYYY-MM-DD format)
        const today = new Date();
        body.start_date = today.toISOString().split('T')[0];
      }

      if (customerName) body.customer_name = customerName;

      if (selectedMethod.requiresRedirectUrl) {
        body.redirect_url = origin;
        body.cancel_url = `${origin}/cancelled?plan=${encodeURIComponent(plan.name)}`;
      }
      if (selectedMethod.requiresPhone && phoneNumber && phoneCountryCode) {
        body.customer_phone_number = phoneNumber;
        body.customer_phone_number_country_code = phoneCountryCode;
      }

      // Use different endpoints for cards vs APMs
      const endpoint = selectedMethod.id === 'card' ? '/api/recurring-billing' : '/api/embedded-recurring-billing';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        onError(data.message || 'Something went wrong');
        return;
      }

      // For card payments, redirect to hosted checkout URL
      if (selectedMethod.id === 'card' && data.url) {
        sessionStorage.setItem('hp_checkout_state', JSON.stringify({
          planId: plan.id,
          planName: plan.name,
          currency,
          environment,
        }));
        window.location.href = data.url;
        return;
      }

      // For redirect payments (direct_link), save state and let HitPay handle the redirect
      if (data.direct_link?.direct_link_url) {
        sessionStorage.setItem('hp_checkout_state', JSON.stringify({
          planId: plan.id,
          planName: plan.name,
          currency,
          environment,
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
    <section className="py-8 sm:py-12 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-8">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
            Setting up <strong>{plan.name} Plan</strong> —{' '}
            <strong>{formatPrice(plan.basePriceSGD, currency)}/month</strong>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your details</h3>
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as Currency)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="SGD">{CURRENCY_FLAGS.SGD} SGD</option>
                <option value="MYR">{CURRENCY_FLAGS.MYR} MYR</option>
                <option value="VND">{CURRENCY_FLAGS.VND} VND</option>
                <option value="PHP">{CURRENCY_FLAGS.PHP} PHP</option>
                <option value="THB">{CURRENCY_FLAGS.THB} THB</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  id="customer-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="customer-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment method</h3>
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
              <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 mb-1">
                Phone number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-gray-100 border border-gray-300 rounded-l-lg text-sm text-gray-600 border-r-0">
                  +{phoneCountryCode}
                </span>
                <input
                  id="phone-number"
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
            {loading ? 'Processing...' : `Pay with ${selectedMethod.name}`}
          </button>
          <p className="text-xs text-center text-gray-400 -mt-2">
            You will be redirected to our secure payment page.
          </p>
        </form>
        </div>
      </div>
    </section>
  );
}
