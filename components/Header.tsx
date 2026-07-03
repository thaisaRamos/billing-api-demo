'use client';

import Image from 'next/image';
import type { Currency } from '@/lib/plans';
import { CURRENCY_LABELS } from '@/lib/plans';

interface HeaderProps {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

const CURRENCIES: Currency[] = ['SGD', 'MYR', 'PHP', 'VND', 'THB'];

export default function Header({
  currency,
  onCurrencyChange,
}: HeaderProps) {
  return (
    <header className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src="/hitpay-icon.svg"
            alt="HitPay"
            width={40}
            height={40}
            className="h-9 sm:h-10 w-auto"
            priority
          />
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">Billing Demo</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as Currency)}
            className="text-sm rounded-lg px-3 sm:px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer font-medium hover:border-gray-400 transition-colors bg-white text-gray-900"
            aria-label="Select currency"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
