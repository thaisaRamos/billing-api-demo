'use client';

import type { RecurringBillingResponse } from '@/lib/hitpay';

interface ResultCardProps {
  response: RecurringBillingResponse;
  onReset: () => void;
}

export default function ResultCard({ response, onReset }: ResultCardProps) {
  const getNextChargeDate = () => {
    const today = new Date();
    const next = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return next.toLocaleDateString();
  };
  const nextChargeDate = getNextChargeDate();

  return (
    <section className="py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="p-6">
            {/* Success Heading */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Subscription Activated!</h1>
            <p className="text-center text-gray-600 mb-6">Your subscription has been successfully set up</p>

            {/* Plan Details Card */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-5">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-4">
                <p className="text-xs text-indigo-200 uppercase tracking-wide font-semibold mb-0.5">Plan</p>
                <p className="text-white font-bold text-lg leading-snug">{response.name || 'Subscription'}</p>
              </div>

              <div className="divide-y divide-gray-100">
                {response.amount && (
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="text-sm font-semibold text-gray-900">{response.amount} {response.currency}/month</span>
                  </div>
                )}
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm text-gray-500">Next Charge</span>
                  <span className="text-sm font-semibold text-gray-900">{nextChargeDate}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {response.qr_code_data && (
              <QrCodeResult qrCodeData={response.qr_code_data} paymentMethod={response.payment_methods[0]} />
            )}

            {/* What's Next */}
            <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 mb-8">
              <p className="text-sm font-semibold text-gray-700 mb-3">What's next</p>
              <ul className="space-y-2.5">
                {[
                  `Your first charge will be processed on ${nextChargeDate}`,
                  'You\'ll receive a confirmation email shortly',
                  'Manage your subscription anytime from your account',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <button
              onClick={onReset}
              className="block w-full text-center bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors mb-4"
            >
              Set Up Another Subscription
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

function QrCodeResult({
  qrCodeData,
  paymentMethod,
}: {
  qrCodeData: NonNullable<RecurringBillingResponse['qr_code_data']>;
  paymentMethod: string;
}) {
  const isUrl =
    qrCodeData.qr_code.startsWith('http') || qrCodeData.qr_code.startsWith('data:');

  return (
    <div className="text-center py-4">
      <p className="text-gray-600 mb-6">
        Ask the customer to scan this QR code with their{' '}
        {paymentMethod === 'zalopay' ? 'ZaloPay' : 'payment'} app.
      </p>
      {isUrl ? (
        <img
          src={qrCodeData.qr_code}
          alt="ZaloPay QR code"
          className="mx-auto w-48 h-48 object-contain border border-gray-200 rounded-xl p-2"
        />
      ) : (
        <div className="mx-auto w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center p-4">
          <p className="text-xs text-gray-500 break-all font-mono">{qrCodeData.qr_code}</p>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-3">
        Expires:{' '}
        {new Date(qrCodeData.qr_code_expiry).toLocaleString()}
      </p>
    </div>
  );
}
