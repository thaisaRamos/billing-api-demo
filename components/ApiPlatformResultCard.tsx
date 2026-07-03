'use client';

import type { RecurringBillingResponse } from '@/lib/hitpay';

interface ApiPlatformResultCardProps {
  response: RecurringBillingResponse;
  onReset: () => void;
}

export default function ApiPlatformResultCard({ response, onReset }: ApiPlatformResultCardProps) {

  return (
    <section className="py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="p-6">
            {/* Success Heading */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Account Activated!</h1>
            <p className="text-center text-gray-600 mb-6">Your NovaSend messaging account is ready to use</p>

            {/* Account Details Card */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-5">
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-4">
                <p className="text-xs text-violet-200 uppercase tracking-wide font-semibold mb-0.5">Service</p>
                <p className="text-white font-bold text-lg leading-snug">{response.name || 'NovaSend Messaging'}</p>
              </div>

              <div className="divide-y divide-gray-100">
                {response.amount && (
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <span className="text-sm text-gray-500">Verification Amount</span>
                    <span className="text-sm font-semibold text-gray-900">{response.amount} {response.currency}</span>
                  </div>
                )}
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-sm font-semibold text-gray-900">{response.customer_email}</span>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 mb-8">
              <p className="text-sm font-semibold text-gray-700 mb-3">What's next</p>
              <ul className="space-y-2.5">
                {[
                  'Start sending messages via the NovaSend API',
                  'Monitor usage and costs in your dashboard',
                  'Explore integration options and webhooks',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <button
              onClick={onReset}
              className="block w-full text-center bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors mb-4"
            >
              Activate Another Account
            </button>

            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={onReset}
                className="text-sm text-gray-500 hover:text-gray-700 underline cursor-pointer"
              >
                Start over
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
