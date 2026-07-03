'use client';

import Link from 'next/link';

export default function ApiPlatformCancelledPage() {
  function handleTryAgain() {
    sessionStorage.setItem('hp_restore_api_platform', 'true');
    window.location.href = '/';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <span className="font-bold text-lg text-gray-900">HitPay</span>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          API Demo
        </span>
      </header>

      <main className="max-w-lg mx-auto px-6 py-14">
        {/* Red X Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Payment Cancelled</h1>
        <p className="text-gray-500 text-sm text-center mb-8">
          Your payment was not completed. Please try again or contact support if you encounter any issues.
        </p>

        {/* What you can do */}
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-3">What you can do</p>
          <ul className="space-y-2.5">
            {[
              'Try a different payment method',
              'Check your account details',
              'Contact support for assistance',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <span className="text-sm text-gray-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleTryAgain}
          className="block w-full text-center bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </main>
    </div>
  );
}
