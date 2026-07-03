import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlanCard from '@/components/PlanCard';
import PlansSection from '@/components/PlansSection';
import type { Plan } from '@/lib/plans';

const starterPlan: Plan = {
  id: 'starter',
  name: 'Starter',
  tagline: 'For individuals',
  basePriceSGD: 9,
  features: ['100 transactions', 'Email support'],
  highlighted: false,
};

const proPlan: Plan = {
  id: 'pro',
  name: 'Pro',
  tagline: 'For teams',
  basePriceSGD: 29,
  features: ['Unlimited transactions', 'Priority support'],
  highlighted: true,
};

describe('PlanCard', () => {
  it('renders the plan name', () => {
    render(
      <PlanCard plan={starterPlan} currency="SGD" selected={false} onSelect={vi.fn()} />
    );
    expect(screen.getByText('Starter')).toBeInTheDocument();
  });

  it('renders the formatted SGD price', () => {
    render(
      <PlanCard plan={starterPlan} currency="SGD" selected={false} onSelect={vi.fn()} />
    );
    expect(screen.getByText('S$9.00')).toBeInTheDocument();
  });

  it('renders converted MYR price', () => {
    render(
      <PlanCard plan={starterPlan} currency="MYR" selected={false} onSelect={vi.fn()} />
    );
    expect(screen.getByText('RM31.05')).toBeInTheDocument();
  });

  it('renders plan features', () => {
    render(
      <PlanCard plan={starterPlan} currency="SGD" selected={false} onSelect={vi.fn()} />
    );
    expect(screen.getByText('100 transactions')).toBeInTheDocument();
    expect(screen.getByText('Email support')).toBeInTheDocument();
  });

  it('calls onSelect when button is clicked', () => {
    const onSelect = vi.fn();
    render(
      <PlanCard plan={starterPlan} currency="SGD" selected={false} onSelect={onSelect} />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(starterPlan);
  });

  it('shows "Selected" when selected', () => {
    render(
      <PlanCard plan={starterPlan} currency="SGD" selected={true} onSelect={vi.fn()} />
    );
    expect(screen.getByText('Selected')).toBeInTheDocument();
  });
});

describe('PlansSection', () => {
  const plans: Plan[] = [starterPlan, proPlan];

  it('renders all plans', () => {
    render(
      <PlansSection plans={plans} currency="SGD" selectedPlanId={null} onSelectPlan={vi.fn()} />
    );
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('passes selected state to the correct plan', () => {
    render(
      <PlansSection
        plans={plans}
        currency="SGD"
        selectedPlanId="starter"
        onSelectPlan={vi.fn()}
      />
    );
    expect(screen.getByText('Selected')).toBeInTheDocument();
  });
});
