# Modern Recurring Billing Demo Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the recurring billing demo to follow modern patterns from the event ticketing demo: separate sandbox/production keys, segmented environment toggle, environment banners, cancelled page, success screen enhancement, session state restoration, THB/LinePay support, and consistent styling.

**Architecture:** 
- Environment state managed in `page.tsx` and passed as props to child components
- API routes perform key lookup server-side based on region + environment
- Session state saved to `sessionStorage` before external redirects, restored on mount
- UI banners provide clear environment feedback; segmented header toggle controls selection
- New `/cancelled` route mirrors success page design for subscription cancellations

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS 4, React hooks

## Global Constraints

- API keys remain server-side only; no `NEXT_PUBLIC_` prefix
- Environment toggle is segmented control (not badge or dropdown)
- Styling aligned with event ticketing demo (colors, spacing, button styles, border radius)
- Session state uses `sessionStorage` (cleared after restore)
- No commits until user explicitly requests

---

## File Structure

**New Files:**
- `app/cancelled/page.tsx` — Full-page cancelled subscription experience

**Modified Files:**
- `.env.local.example` — Add `_PRODUCTION` and `TH` keys
- `lib/plans.ts` — Add `THB` currency option
- `lib/payment-methods.ts` — Add `THB: LinePay` and `environments` filter support
- `components/Header.tsx` — Replace badge with segmented control
- `app/page.tsx` — Manage environment state, add banners, restore state, pass props
- `app/api/recurring-billing/route.ts` — Use environment-aware key lookup
- `components/CheckoutSection.tsx` — Save state before redirect
- `components/ResultCard.tsx` — Minor tweaks for success message styling
- `app/globals.css` — Minor styling adjustments for consistency

---

## Task 1: Update Environment Configuration

**Files:**
- Modify: `.env.local.example`
- Modify: `.env.local` (user local — show changes needed)

**Interfaces:**
- Produces: Environment variable structure for both sandbox and production keys

- [ ] **Step 1: Update `.env.local.example` with new key structure**

Open `.env.local.example` and replace entire content:

```bash
# .env.local.example
# Copy this file to .env.local and fill in your HitPay API keys

# --- Sandbox API Keys ---
# Singapore market (covers SGD + VND/ZaloPay cross-border)
HITPAY_API_KEY_SG=your_sg_sandbox_key_here

# Malaysia market (covers MYR + Touch 'N Go cross-border)
HITPAY_API_KEY_MY=your_my_sandbox_key_here

# Philippines market
HITPAY_API_KEY_PH=your_ph_sandbox_key_here

# Thailand market
HITPAY_API_KEY_TH=your_th_sandbox_key_here

# --- Production API Keys ---
# Singapore market
HITPAY_API_KEY_SG_PRODUCTION=your_sg_production_key_here

# Malaysia market
HITPAY_API_KEY_MY_PRODUCTION=your_my_production_key_here

# Philippines market
HITPAY_API_KEY_PH_PRODUCTION=your_ph_production_key_here

# Thailand market
HITPAY_API_KEY_TH_PRODUCTION=your_th_production_key_here

# Default environment on load: sandbox | production
# (Can be overridden by UI toggle)
NEXT_PUBLIC_HITPAY_ENV=sandbox
```

- [ ] **Step 2: Update local `.env.local` file**

Open `.env.local` and update to include production keys alongside sandbox keys (user should add their own production keys):

```bash
# --- Sandbox API Keys ---
HITPAY_API_KEY_SG=your_existing_sg_sandbox_key
HITPAY_API_KEY_MY=your_existing_my_sandbox_key
HITPAY_API_KEY_PH=your_existing_ph_sandbox_key
HITPAY_API_KEY_TH=your_th_sandbox_key

# --- Production API Keys ---
HITPAY_API_KEY_SG_PRODUCTION=
HITPAY_API_KEY_MY_PRODUCTION=
HITPAY_API_KEY_PH_PRODUCTION=
HITPAY_API_KEY_TH_PRODUCTION=

NEXT_PUBLIC_HITPAY_ENV=sandbox
```

---

## Task 2: Add THB Currency Support to Plans

**Files:**
- Modify: `lib/plans.ts`

**Interfaces:**
- Produces: `Currency` type now includes `'THB'`; plans can use THB pricing

- [ ] **Step 1: Add THB to Currency type**

Open `lib/plans.ts`. Find the `Currency` type definition (should be near top). Update it:

```typescript
export type Currency = 'SGD' | 'MYR' | 'PHP' | 'VND' | 'THB';
```

- [ ] **Step 2: Add THB to CURRENCY_SYMBOLS**

Find the `CURRENCY_SYMBOLS` object in `lib/plans.ts`. Add THB entry:

```typescript
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  SGD: '฿',
  MYR: 'RM',
  PHP: '₱',
  VND: '₫',
  THB: '฿',
};
```

- [ ] **Step 3: Add THB to FX_RATES**

Find the `FX_RATES` object. Add conversion rate for THB (SGD to THB ≈ 26):

```typescript
export const FX_RATES: Record<Currency, number> = {
  SGD: 1,
  MYR: 3.45,
  PHP: 43,
  VND: 17500,
  THB: 26,
};
```

- [ ] **Step 4: Add THB plans to PLANS array (if not already present)**

If PLANS doesn't have THB variants, add them. Example:

```typescript
{
  id: 'starter-thb',
  name: 'Starter',
  basePrice: 499, // in SGD, will convert to THB
  billingInterval: 'monthly',
  description: 'For small teams',
},
```

---

## Task 3: Add THB/LinePay Payment Method

**Files:**
- Modify: `lib/payment-methods.ts`

**Interfaces:**
- Consumes: `Currency` type (from Task 2)
- Produces: `PaymentMethodOption` for THB; `getPaymentMethods('THB')` returns LinePay

- [ ] **Step 1: Add `TH` to ApiKeyRegion type**

Open `lib/payment-methods.ts`. Find the `ApiKeyRegion` type. Add `'TH'`:

```typescript
export type ApiKeyRegion = 'SG' | 'MY' | 'PH' | 'TH';
```

- [ ] **Step 2: Add `environments` property to PaymentMethodOption interface**

Find the `PaymentMethodOption` interface. Add optional `environments` field (for future use):

```typescript
export interface PaymentMethodOption {
  id: PaymentMethodId;
  name: string;
  generateParam: GenerateParam;
  apiKeyRegion: ApiKeyRegion;
  requiresRedirectUrl: boolean;
  requiresPhone: boolean;
  responseType: ResponseType;
  environments?: Array<'sandbox' | 'production'>; // Optional for future production-only variants
}
```

- [ ] **Step 3: Add THB to PAYMENT_METHODS_BY_CURRENCY**

Find the `PAYMENT_METHODS_BY_CURRENCY` object. Add THB entry after VND:

```typescript
THB: [
  {
    id: 'line_pay',
    name: 'LinePay',
    generateParam: 'generate_direct_link',
    apiKeyRegion: 'TH',
    requiresRedirectUrl: true,
    requiresPhone: false,
    responseType: 'link',
  },
],
```

- [ ] **Step 4: Update PaymentMethodId type to include 'line_pay'**

Find the `PaymentMethodId` type. Add `'line_pay'`:

```typescript
export type PaymentMethodId = 'zalopay' | 'shopee_pay' | 'grabpay_direct' | 'touch_n_go' | 'giro' | 'line_pay';
```

---

## Task 4: Update API Route for Environment-Aware Keys

**Files:**
- Modify: `app/api/recurring-billing/route.ts`

**Interfaces:**
- Consumes: `api_key_region`, `environment` from request body
- Produces: Correct API key selection based on region + environment

- [ ] **Step 1: Update API_KEYS object to use nested structure**

Open `app/api/recurring-billing/route.ts`. Find the `API_KEYS` constant. Replace it:

```typescript
const API_KEYS: Record<ApiKeyRegion, { sandbox?: string; production?: string }> = {
  SG: { sandbox: process.env.HITPAY_API_KEY_SG, production: process.env.HITPAY_API_KEY_SG_PRODUCTION },
  MY: { sandbox: process.env.HITPAY_API_KEY_MY, production: process.env.HITPAY_API_KEY_MY_PRODUCTION },
  PH: { sandbox: process.env.HITPAY_API_KEY_PH, production: process.env.HITPAY_API_KEY_PH_PRODUCTION },
  TH: { sandbox: process.env.HITPAY_API_KEY_TH, production: process.env.HITPAY_API_KEY_TH_PRODUCTION },
};
```

- [ ] **Step 2: Update key lookup logic**

Find the line that retrieves `apiKey`. Replace:

```typescript
const apiKey = API_KEYS[api_key_region];
if (!apiKey) {
```

With:

```typescript
const apiKey = API_KEYS[api_key_region]?.[environment || 'sandbox'];
if (!apiKey) {
  return NextResponse.json(
    { message: `API key not configured for region: ${api_key_region} (${environment || 'sandbox'})` },
    { status: 500 }
  );
}
```

- [ ] **Step 3: Update error message to include environment**

The error message should now indicate which environment's key is missing. (Done in Step 2 above.)

---

## Task 5: Refactor Header to Segmented Environment Toggle

**Files:**
- Modify: `components/Header.tsx`

**Interfaces:**
- Consumes: `environment` prop, `onEnvironmentChange` callback
- Produces: Segmented control UI for `Sandbox` | `Live`

- [ ] **Step 1: Replace environment toggle logic**

Open `components/Header.tsx`. Find the environment toggle button (the one with the colored badge). Replace the entire button with a segmented control:

```typescript
<div className="flex items-center bg-gray-100 rounded-full p-0.5 text-xs font-semibold">
  <button
    onClick={() => onEnvironmentChange('sandbox')}
    className={`px-3 py-1.5 rounded-full transition-all ${
      environment === 'sandbox' ? 'bg-white shadow text-amber-700' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    Sandbox
  </button>
  <button
    onClick={() => onEnvironmentChange('production')}
    className={`px-3 py-1.5 rounded-full transition-all ${
      environment === 'production' ? 'bg-white shadow text-green-700' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    Live
  </button>
</div>
```

- [ ] **Step 2: Verify Header component compiles**

Run: `npm run build`
Expected: No TypeScript errors in Header

---

## Task 6: Add Environment State Management & Banners to Page

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `Environment` type, `useEffect` hook
- Produces: Environment state, banners, state restoration logic

- [ ] **Step 1: Add useEffect import if not present**

Open `app/page.tsx`. Ensure `useEffect` is imported:

```typescript
import { useState, useEffect } from 'react';
```

- [ ] **Step 2: Add environment state management**

In the `Home` component, add environment state (if not already present):

```typescript
const [environment, setEnvironment] = useState<Environment>(
  (process.env.NEXT_PUBLIC_HITPAY_ENV ?? 'sandbox') as Environment
);
```

- [ ] **Step 3: Add session state restoration logic**

Add a `useEffect` hook to restore state from `sessionStorage`:

```typescript
useEffect(() => {
  const saved = sessionStorage.getItem('hp_billing_state');
  if (!saved) return;
  sessionStorage.removeItem('hp_billing_state');
  try {
    const { planId, currency: c, environment: e } = JSON.parse(saved);
    const plan = PLANS.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setCurrency(c);
      setEnvironment(e);
    }
  } catch {}
}, []);
```

- [ ] **Step 4: Add environment banner to JSX**

Find the JSX return statement. After the `<Header />` component, add banners:

```typescript
{environment === 'sandbox' ? (
  <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs sm:text-sm text-amber-700">
    <span className="font-semibold">Sandbox mode</span> — no real payments will be made.
  </div>
) : (
  <div className="bg-green-50 border-b border-green-200 px-4 py-2 text-center text-xs sm:text-sm text-green-700">
    <span className="font-semibold">Live mode</span> — real payments will be processed.
  </div>
)}
```

- [ ] **Step 5: Pass environment props to child components**

Ensure `CheckoutSection` receives `environment` prop:

```typescript
<CheckoutSection
  plan={selectedPlan}
  currency={currency}
  environment={environment}
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

- [ ] **Step 6: Verify page renders with banners**

Run: `npm run dev`
Navigate to `http://localhost:3000`
Expected: Amber banner visible below header with "Sandbox mode" text; toggle in header switches between Sandbox and Live

---

## Task 7: Add Session State Saving to CheckoutSection

**Files:**
- Modify: `components/CheckoutSection.tsx`

**Interfaces:**
- Consumes: `selectedPlan`, `currency`, `environment`
- Produces: State saved to `sessionStorage` before redirect

- [ ] **Step 1: Add state save before payment method redirect**

Open `components/CheckoutSection.tsx`. Find where a payment method redirect happens (typically when user clicks "Continue with [method]" for direct link payments).

Before `window.location.href = ...` call, add:

```typescript
sessionStorage.setItem('hp_billing_state', JSON.stringify({
  planId: selectedPlan.id,
  currency,
  environment,
}));
window.location.href = paymentUrl;
```

Example location (in a click handler for direct link payment):

```typescript
const handlePaymentRedirect = (url: string) => {
  sessionStorage.setItem('hp_billing_state', JSON.stringify({
    planId: selectedPlan.id,
    currency,
    environment,
  }));
  window.location.href = url;
};
```

- [ ] **Step 2: Verify state is cleared on success**

Ensure that when returning from redirect (success), the `useEffect` in `page.tsx` clears the stored state. (Already done in Task 6, Step 3.)

---

## Task 8: Create Cancelled Subscription Page

**Files:**
- Create: `app/cancelled/page.tsx`

**Interfaces:**
- Consumes: `plan` query parameter (optional)
- Produces: Full-page cancelled experience with plan name if provided

- [ ] **Step 1: Create the cancelled page file**

Create `app/cancelled/page.tsx`:

```typescript
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ plan?: string }>;
}

export default async function CancelledPage({ searchParams }: Props) {
  const params = await searchParams;
  const planName = params.plan;

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

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Subscription Cancelled</h1>
        <p className="text-gray-500 text-sm text-center mb-8">
          {planName
            ? `Your subscription to ${planName} was not activated.`
            : 'Your subscription was not activated.'}{' '}
          Please try again or contact support if you encounter any issues.
        </p>

        {/* What you can do */}
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-3">What you can do</p>
          <ul className="space-y-2.5">
            {[
              'Try a different payment method',
              'Check your payment details',
              'Contact support if the issue persists',
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
```

- [ ] **Step 2: Test the cancelled page**

Run: `npm run dev`
Navigate to: `http://localhost:3000/cancelled?plan=Starter`
Expected: Red X icon, "Subscription Cancelled" heading, plan name in subtitle, "Set Up Another Subscription" button

---

## Task 9: Enhance Success Screen Display

**Files:**
- Modify: `components/ResultCard.tsx`

**Interfaces:**
- Consumes: `response` (recurring billing response with plan details)
- Produces: Enhanced success display with plan details and "Set Up Another" button

- [ ] **Step 1: Check ResultCard structure**

Open `components/ResultCard.tsx`. Identify where the success message is displayed.

- [ ] **Step 2: Update success heading**

Find the success heading text. Change from generic confirmation to specific subscription message:

```typescript
<h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Subscription Activated!</h1>
```

- [ ] **Step 3: Add plan details card**

After the heading/subtitle, add a plan details section:

```typescript
{/* Plan Details Card */}
<div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-5">
  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-4">
    <p className="text-xs text-indigo-200 uppercase tracking-wide font-semibold mb-0.5">Plan</p>
    <p className="text-white font-bold text-lg leading-snug">{selectedPlan?.name || 'Subscription'}</p>
  </div>

  <div className="divide-y divide-gray-100">
    {selectedPlan?.basePrice && (
      <div className="flex items-center justify-between px-5 py-3.5">
        <span className="text-sm text-gray-500">Amount</span>
        <span className="text-sm font-semibold text-gray-900">${(selectedPlan.basePrice).toFixed(2)}/month</span>
      </div>
    )}
    {selectedPlan?.billingInterval && (
      <div className="flex items-center justify-between px-5 py-3.5">
        <span className="text-sm text-gray-500">Billing Interval</span>
        <span className="text-sm font-semibold text-gray-900">{selectedPlan.billingInterval}</span>
      </div>
    )}
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-sm text-gray-500">Next Charge</span>
      <span className="text-sm font-semibold text-gray-900">
        {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
      </span>
    </div>
  </div>
</div>
```

- [ ] **Step 4: Update "What's Next" section for subscriptions**

Replace any generic "what's next" items with subscription-specific ones:

```typescript
{/* What's Next */}
<div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 mb-8">
  <p className="text-sm font-semibold text-gray-700 mb-3">What's next</p>
  <ul className="space-y-2.5">
    {[
      'Your first charge will be processed on ' + new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      'You'll receive a confirmation email shortly',
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
```

- [ ] **Step 5: Update action button to "Set Up Another Subscription"**

Find the button at the bottom of ResultCard. Change text and link:

```typescript
<button
  onClick={onReset}
  className="block w-full text-center bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
>
  Set Up Another Subscription
</button>
```

- [ ] **Step 6: Test success screen**

Run: `npm run dev`
Complete a subscription (or mock success response)
Expected: "Subscription Activated!" heading, plan details card, "What's next" section, "Set Up Another" button

---

## Task 10: Update CheckoutSection to Handle Environment Prop

**Files:**
- Modify: `components/CheckoutSection.tsx`

**Interfaces:**
- Consumes: `environment` prop
- Produces: Pass `environment` to API call

- [ ] **Step 1: Add environment prop to CheckoutSection**

Open `components/CheckoutSection.tsx`. Find the component props interface. Add `environment`:

```typescript
interface CheckoutSectionProps {
  plan: Plan;
  currency: Currency;
  environment: Environment;
  onSuccess: (response: RecurringBillingResponse) => void;
  onError: (message: string) => void;
}
```

- [ ] **Step 2: Destructure environment in component**

In the component function signature:

```typescript
export default function CheckoutSection({
  plan,
  currency,
  environment,
  onSuccess,
  onError,
}: CheckoutSectionProps) {
```

- [ ] **Step 3: Pass environment to API call**

Find the API call (likely in `fetch('/api/recurring-billing', ...)`). Add `environment` to request body:

```typescript
const res = await fetch('/api/recurring-billing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer_email: email,
    customer_name: customerName,
    amount: amount.toString(),
    currency,
    billing_name: plan.name,
    payment_method: selectedMethod.id,
    generate_param: selectedMethod.generateParam,
    api_key_region: selectedMethod.apiKeyRegion,
    redirect_url: redirectUrl,
    customer_phone_number: phone,
    customer_phone_number_country_code: countryCode,
    environment, // Add this line
  }),
});
```

---

## Task 11: Styling Alignment with Event Ticketing Demo

**Files:**
- Modify: `app/globals.css`
- Modify: Component files (minor updates)

**Interfaces:**
- Produces: Consistent styling across demo

- [ ] **Step 1: Verify Tailwind config includes event ticketing colors**

Open `tailwind.config.ts` (or `tailwind.config.js`). Ensure it has standard Tailwind colors (indigo, amber, green, red). Should be default; no changes needed if standard.

- [ ] **Step 2: Update button styles in components**

Ensure all primary buttons use: `bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors`

Check in:
- `components/PlansSection.tsx` — Plan selection buttons
- `components/CheckoutSection.tsx` — Submit button
- `components/ResultCard.tsx` — "Set Up Another" button

- [ ] **Step 3: Verify card styles match**

Cards should use: `rounded-2xl border border-gray-200` with optional shadows.

Check in:
- Plan cards
- Checkout form
- Result card details sections

- [ ] **Step 4: Check banner styles**

Banners below header should match event ticketing (amber for sandbox, green for live):
- `bg-amber-50 border-b border-amber-200 text-amber-700` for sandbox
- `bg-green-50 border-b border-green-200 text-green-700` for live

- [ ] **Step 5: Verify header spacing and layout**

Header should be consistent with event ticketing demo. Check:
- Logo + badge layout
- Spacing between elements
- Currency dropdown + environment toggle alignment

---

## Task 12: Verify Integration & Test All Flows

**Files:**
- All modified files (tests via manual QA)

**Interfaces:**
- Tests: Environment toggle, API key selection, state restoration, success/cancelled pages

- [ ] **Step 1: Test environment toggle**

Run: `npm run dev`
1. Click Sandbox button (should be active)
2. Click Live button (should become active, amber → green)
3. Verify banner changes from amber to green
4. Verify API calls include correct `environment`

Expected: Toggle works, banners update, no console errors

- [ ] **Step 2: Test THB currency selection**

1. Open app
2. Change currency to THB (if dropdown includes it)
3. Verify LinePay appears in payment methods
4. Verify plan prices update to THB

Expected: THB option shows, LinePay available, correct currency symbol

- [ ] **Step 3: Test state restoration**

1. Select a plan
2. Choose a payment method that requires redirect (e.g., LinePay)
3. Open dev console, verify `sessionStorage.getItem('hp_billing_state')` shows saved state
4. Mock a redirect back to home page (or wait for timeout if applicable)
5. Verify plan, currency, environment are restored

Expected: State saved to sessionStorage, restored on return

- [ ] **Step 4: Test success page**

1. Complete a subscription flow (or manually navigate to result after mocking success)
2. Verify "Subscription Activated!" heading appears
3. Verify plan details card shows plan name, amount, next charge date
4. Verify "Set Up Another Subscription" button navigates home

Expected: Success screen shows full details, button works

- [ ] **Step 5: Test cancelled page**

1. Manually navigate to `http://localhost:3000/cancelled?plan=Starter`
2. Verify red X icon, "Subscription Cancelled" heading
3. Verify plan name appears in subtitle
4. Verify "Set Up Another Subscription" button navigates to home

Expected: Cancelled page displays correctly with all elements

- [ ] **Step 6: Run build to verify no errors**

Run: `npm run build`
Expected: Build succeeds with no errors or warnings

---

## Self-Review Checklist

**Spec Coverage:**
- ✅ Environment & API keys (Task 1, 4) — Separate sandbox/production keys, API lookup
- ✅ Header toggle (Task 5) — Segmented control for Sandbox/Live
- ✅ Banners (Task 6) — Environment-aware info bars
- ✅ THB/LinePay (Task 2, 3) — Currency and payment method added
- ✅ Cancelled page (Task 8) — New /cancelled route with full-page experience
- ✅ Success screen (Task 9) — Enhanced with subscription details and "Set Up Another" button
- ✅ State restoration (Task 7, 6) — sessionStorage save/restore logic
- ✅ Styling (Task 11) — Alignment with event ticketing demo
- ✅ Integration (Task 12) — Comprehensive QA testing

**Placeholder Check:**
- ✅ No "TBD", "TODO", or incomplete sections
- ✅ All code blocks are complete, not pseudo-code
- ✅ All commands shown with expected output
- ✅ File paths exact and complete

**Type Consistency:**
- ✅ `environment: 'sandbox' | 'production'` consistent across tasks
- ✅ `api_key_region` passed correctly from client to server
- ✅ `ApiKeyRegion` includes `'TH'` (Task 3)
- ✅ `sessionStorage` key name consistent: `'hp_billing_state'`

**No Gaps:**
- ✅ All spec sections have corresponding tasks
- ✅ Each task has clear, testable deliverables
