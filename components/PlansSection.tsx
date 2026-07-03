'use client';

import type { Plan, Currency } from '@/lib/plans';
import PlanCard from '@/components/PlanCard';

interface PlansSectionProps {
  plans: Plan[];
  currency: Currency;
  selectedPlanId: string | null;
  onSelectPlan: (plan: Plan) => void;
}

export default function PlansSection({
  plans,
  currency,
  selectedPlanId,
  onSelectPlan,
}: PlansSectionProps) {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Choose Your Plan</h2>
          <p className="text-gray-600 text-base sm:text-lg">Select a subscription plan to get started with recurring billing</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currency={currency}
              selected={selectedPlanId === plan.id}
              onSelect={onSelectPlan}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
