'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PlansSection from '@/components/PlansSection';
import CheckoutSection from '@/components/CheckoutSection';
import StartupSection from '@/components/StartupSection';
import ResultCard from '@/components/ResultCard';
import ApiPlatformResultCard from '@/components/ApiPlatformResultCard';
import { PLANS } from '@/lib/plans';
import type { Plan, Currency } from '@/lib/plans';
import type { RecurringBillingResponse } from '@/lib/hitpay';
import type { Environment } from '@/lib/hitpay';

type DemoMode = 'subscription' | 'api-platform';

export default function Home() {
  const [demoMode, setDemoMode] = useState<DemoMode>('subscription');
  const [currency, setCurrency] = useState<Currency>('SGD');
  const [environment] = useState<Environment>('sandbox');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [result, setResult] = useState<RecurringBillingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Restore API platform mode if coming from cancelled page
    const restoreApiPlatform = sessionStorage.getItem('hp_restore_api_platform');
    if (restoreApiPlatform) {
      setDemoMode('api-platform');
      sessionStorage.removeItem('hp_restore_api_platform');
    }

    // Check for HitPay redirect callback with query parameters
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const status = params.get('status');
    const type = params.get('type');
    const reference = params.get('reference');

    // Handle payment callback from HitPay mock payment
    if (status && reference) {
      const saved = sessionStorage.getItem('hp_checkout_state');
      const savedApiCheckout = sessionStorage.getItem('hp_api_platform_checkout_state');

      if (type === 'recurring' && saved) {
        try {
          const { planId, planName, currency: c, environment: e } = JSON.parse(saved);
          const plan = PLANS.find(p => p.id === planId);

          if (status === 'canceled') {
            // Payment was cancelled - redirect to cancelled page
            const planQueryParam = planName ? `?plan=${encodeURIComponent(planName)}` : '';
            sessionStorage.removeItem('hp_checkout_state');
            window.location.href = `/cancelled${planQueryParam}`;
            return;
          } else if (status === 'active' || status === 'completed') {
            // Payment was successful - show success screen
            const mockResult = {
              id: reference,
              status: 'completed',
              currency: c,
              amount: plan?.basePriceSGD || 0,
              customer_name: '',
              customer_email: '',
              name: plan?.name || 'Subscription',
              payment_methods: [],
              created_at: new Date().toISOString(),
            };
            setDemoMode('subscription');
            setResult(mockResult as any);
            sessionStorage.removeItem('hp_checkout_state');
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => {
              document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        } catch (err) {
          console.error('Error handling recurring billing callback:', err);
        }
        return;
      } else if (type === 'recurring' && savedApiCheckout) {
        try {
          const { currency: c, environment: e, customerEmail: email, amount: activationAmount } = JSON.parse(savedApiCheckout);

          if (status === 'canceled') {
            // Account activation was cancelled - redirect to cancelled page
            sessionStorage.removeItem('hp_api_platform_checkout_state');
            window.location.href = '/api-platform/cancelled';
            return;
          } else if (status === 'active' || status === 'completed') {
            // Account activation was successful - save and show success screen
            const mockResult = {
              id: reference,
              status: 'completed',
              currency: c,
              amount: parseFloat(activationAmount) || 0,
              customer_name: 'NovaSend Account',
              customer_email: email || '',
              name: 'NovaSend Messaging',
              payment_methods: [],
              created_at: new Date().toISOString(),
            };
            sessionStorage.setItem('hp_api_platform_result', JSON.stringify(mockResult));
            sessionStorage.removeItem('hp_api_platform_checkout_state');
            window.location.href = '/';
            return;
          }
        } catch (err) {
          console.error('Error handling API platform callback:', err);
        }
        return;
      }
    }

    // Restore subscription payment result from sessionStorage (fallback)
    const savedResult = sessionStorage.getItem('hp_payment_result');
    if (savedResult) {
      try {
        const result = JSON.parse(savedResult);
        setDemoMode('subscription');
        setResult(result);
        sessionStorage.removeItem('hp_payment_result');
        setTimeout(() => {
          document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch {}
      return;
    }

    // Restore API platform payment result from sessionStorage (fallback)
    const savedApiResult = sessionStorage.getItem('hp_api_platform_result');
    if (savedApiResult) {
      try {
        const result = JSON.parse(savedApiResult);
        setDemoMode('api-platform');
        setResult(result);
        sessionStorage.removeItem('hp_api_platform_result');
        setTimeout(() => {
          document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch {}
      return;
    }
  }, []);

  function handleCurrencyChange(newCurrency: Currency) {
    setCurrency(newCurrency);
    setSelectedPlan(null);
    setResult(null);
    setError(null);
  }

  function handleCurrencyChangeInCheckout(newCurrency: Currency) {
    setCurrency(newCurrency);
    // Keep the selected plan, just clear any error/result state
    setResult(null);
    setError(null);
  }

  function handleDemoModeChange(mode: DemoMode) {
    setDemoMode(mode);
    setSelectedPlan(null);
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handlePlanSelect(plan: Plan) {
    setSelectedPlan(plan);
    setResult(null);
    setError(null);
    // Scroll to checkout
    setTimeout(() => {
      document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function handleSuccess(response: RecurringBillingResponse) {
    setResult(response);
    setError(null);
    setTimeout(() => {
      document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function handleError(message: string) {
    setError(message);
  }

  function handleReset() {
    setSelectedPlan(null);
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
      />

      <div className="bg-amber-100 border-b border-amber-200 px-4 sm:px-6 py-2 text-center">
        <p className="text-xs sm:text-sm text-amber-900 max-w-6xl mx-auto">
          Sandbox mode — no real payments will be made.
        </p>
      </div>

      {/* Demo mode toggle */}
      <div className="bg-white border-b border-gray-200 sticky top-14 sm:top-16 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0">
            <button
              onClick={() => handleDemoModeChange('subscription')}
              className={`flex items-center gap-2 px-4 sm:px-8 py-4 sm:py-5 text-sm sm:text-base font-semibold border-b-2 transition-colors cursor-pointer ${
                demoMode === 'subscription'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.669 0-3.218.51-4.5 1.385A7.968 7.968 0 009 4.804z" />
              </svg>
              <span>Recurring Plans</span>
            </button>
            <button
              onClick={() => handleDemoModeChange('api-platform')}
              className={`flex items-center gap-2 px-4 sm:px-8 py-4 sm:py-5 text-sm sm:text-base font-semibold border-b-2 transition-colors cursor-pointer ${
                demoMode === 'api-platform'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span>API Platform</span>
            </button>
          </div>
        </div>
      </div>

      {demoMode === 'subscription' && !result && (
        <>
          <PlansSection
            plans={PLANS}
            currency={currency}
            selectedPlanId={selectedPlan?.id ?? null}
            onSelectPlan={handlePlanSelect}
          />

          {selectedPlan && (
            <div id="checkout">
              <CheckoutSection
                plan={selectedPlan}
                currency={currency}
                environment={environment}
                onCurrencyChange={handleCurrencyChangeInCheckout}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div>
          )}
        </>
      )}

      {demoMode === 'api-platform' && !result && (
        <StartupSection
          currency={currency}
          environment={environment}
          onCurrencyChange={handleCurrencyChange}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}

      {error && (
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {result && (
        <div id="result">
          {demoMode === 'api-platform' ? (
            <ApiPlatformResultCard response={result} onReset={handleReset} />
          ) : (
            <ResultCard response={result} onReset={handleReset} />
          )}
        </div>
      )}

      <footer className="text-center py-8 text-xs text-gray-400 border-t border-gray-200 mt-8">
        HitPay Recurring Billing Demo — For developer reference only
      </footer>
    </div>
  );
}
