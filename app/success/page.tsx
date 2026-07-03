import Link from 'next/link';

interface Props {
  searchParams: Promise<{ plan?: string; amount?: string; currency?: string }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const planName = params.plan || 'Subscription';
  const amount = params.amount || '-';
  const currency = params.currency || '-';
  const nextChargeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <span className="font-bold text-lg text-gray-900">HitPay Recurring Billing</span>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          Demo
        </span>
      </header>

      <main className="max-w-lg mx-auto px-6 py-14">
        {/* Checkmark Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Subscription Activated!</h1>
        <p className="text-gray-500 text-sm text-center mb-8">Your subscription has been successfully set up</p>

        {/* Plan Details Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-5">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-4">
            <p className="text-xs text-indigo-200 uppercase tracking-wide font-semibold mb-0.5">Plan</p>
            <p className="text-white font-bold text-lg leading-snug">{planName}</p>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm text-gray-500">Amount</span>
              <span className="text-sm font-semibold text-gray-900">
                {amount} {currency}/month
              </span>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm text-gray-500">Next Charge</span>
              <span className="text-sm font-semibold text-gray-900">{nextChargeDate}</span>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-3">What's next</p>
          <ul className="space-y-2.5">
            {[
              `Your first charge will be processed on ${nextChargeDate}`,
              "You'll receive a confirmation email shortly",
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

        <Link
          href="/"
          className="block w-full text-center bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Set Up Another Subscription
        </Link>
      </main>
    </div>
  );
}
