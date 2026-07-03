'use client';

import type { Plan, Currency } from '@/lib/plans';
import { formatPrice } from '@/lib/plans';

interface PlanCardProps {
  plan: Plan;
  currency: Currency;
  selected: boolean;
  onSelect: (plan: Plan) => void;
}

export default function PlanCard({ plan, currency, selected, onSelect }: PlanCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 p-5 sm:p-6 transition-all duration-300 h-full cursor-pointer ${
        selected
          ? 'border-blue-600 bg-blue-50 shadow-2xl ring-4 ring-blue-300 ring-offset-2'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
      }`}
      onClick={() => onSelect(plan)}
    >
      {plan.highlighted && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          Most Popular
        </div>
      )}

      <div className="mb-5 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{plan.name}</h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">{plan.tagline}</p>
      </div>

      <div className="mb-6 sm:mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl sm:text-4xl font-extrabold text-blue-600">{formatPrice(plan.basePriceSGD, currency)}</span>
          <span className="text-gray-500 text-xs sm:text-sm">/month</span>
        </div>
      </div>

      <ul className="space-y-2.5 sm:space-y-3 mb-8 sm:mb-10 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
            <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan)}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 cursor-pointer ${
          selected
            ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700'
            : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md'
        }`}
      >
        {selected ? '✓ Selected' : 'Get Started'}
      </button>
    </div>
  );
}
