# Modern Recurring Billing Demo Refactor — Design Spec

**Date:** June 19, 2026  
**Status:** Approved  
**Goal:** Align recurring billing demo with modern patterns from event ticketing demo for consistency, better UX, and production-ready patterns.

---

## Executive Summary

Refactor `hitpay-recurring-billing-demo` to follow the same modern architecture and UX patterns as `hitpay-event-ticketing-demo`. Key improvements:
- Segmented Sandbox/Live toggle (not status badge)
- Environment-aware banners below header
- Separate production/sandbox API keys per region
- New `/cancelled` page for subscription cancellations
- Session state restoration via `sessionStorage` (preserves selection after redirect)
- Styling alignment with event ticketing demo
- Add THB (LinePay) payment method support

---

## 1. Environment & API Key Management

### Current State
- Single API key per region (`HITPAY_API_KEY_SG`, etc.)
- Environment determined by `HITPAY_ENV` env var (global)
- Frontend cannot toggle between sandbox and production

### Proposed Change
**Separate sandbox and production keys; UI controls environment selection.**

#### `.env.local` Structure
```bash
# --- Sandbox Keys ---
HITPAY_API_KEY_SG=sandbox_key_here
HITPAY_API_KEY_MY=sandbox_key_here
HITPAY_API_KEY_PH=sandbox_key_here
HITPAY_API_KEY_TH=sandbox_key_here

# --- Production Keys ---
HITPAY_API_KEY_SG_PRODUCTION=prod_key_here
HITPAY_API_KEY_MY_PRODUCTION=prod_key_here
HITPAY_API_KEY_PH_PRODUCTION=prod_key_here
HITPAY_API_KEY_TH_PRODUCTION=prod_key_here
```

#### API Route Key Lookup
API routes receive `environment` as part of request body:
```typescript
const apiKey = API_KEYS[region]?.[environment];
// e.g., API_KEYS['SG']['production'] or API_KEYS['SG']['sandbox']
```

#### Security
- Keys never exposed to frontend (no `NEXT_PUBLIC_` prefix)
- Client sends only `api_key_region` and `environment`; server looks up actual key
- Same pattern as event ticketing demo

---

## 2. Header Component

### Current State
Environment shown as colored status badge with swap icon and pulsing dot.

### Proposed Change
**Segmented control with two buttons: `Sandbox` | `Live`**

#### Design
- **Container:** Gray background pill (`bg-gray-100 rounded-full p-0.5`)
- **Buttons:** Two clickable segments inside
- **Active state:** White pill with shadow, text color matches mode (amber for Sandbox, green for Live)
- **Inactive state:** Transparent, gray text, hover slightly darker
- **No text suffix:** Just the mode name; no arrows or extra icons

#### Example
```
┌─────────────────────┐
│ [Sandbox] [ Live ]  │  ← Sandbox is active (white pill)
└─────────────────────┘
```

#### Behavior
- Clicking either button toggles the environment state in `page.tsx`
- All subsequent API calls use the selected environment

---

## 3. Environment Awareness Banners

### Position
Below header, full-width, above main content.

### Sandbox Banner
- **Background:** `bg-amber-50` with border `border-amber-200`
- **Text:** "**Sandbox mode** — no real payments will be made."
- **Text color:** `text-amber-700`
- **Font:** `text-xs sm:text-sm`, centered

### Live Banner
- **Background:** `bg-green-50` with border `border-green-200`
- **Text:** "**Live mode** — real payments will be processed."
- **Text color:** `text-green-700`
- **Font:** `text-xs sm:text-sm`, centered

### Behavior
- Banners are **info-only** (no action buttons inside)
- Environment toggle in header is the control point for switching modes
- Banners update immediately when environment changes

---

## 4. Payment Methods

### Existing Methods (No Changes)
Maintain current structure; all work in both sandbox and production:

| Currency | Methods | API Key Region |
|----------|---------|---|
| SGD | Shopee Pay, GrabPay, GIRO | SG |
| MYR | Shopee Pay, GrabPay, Touch 'N Go | MY |
| PHP | Shopee Pay | PH |
| VND | ZaloPay | SG (cross-border) |

### New Method
- **THB (Thai Baht):** LinePay
  - API Key Region: `TH`
  - Response type: `direct_link`
  - Requires redirect URL: `true`
  - Requires phone: `false`

### Implementation
- Add `THB` currency type to `lib/plans.ts`
- Add `TH` to `ApiKeyRegion` type
- Update `PAYMENT_METHODS_BY_CURRENCY` in `lib/payment-methods.ts`
- Add `HITPAY_API_KEY_TH` (sandbox) and `HITPAY_API_KEY_TH_PRODUCTION` to env
- Update API routes to handle TH region

---

## 5. Cancelled Subscription Page (`/cancelled`)

### URL & Params
```
/cancelled?plan={planName}
```

### Design (Full-Page Experience)
Follows same structure as event ticketing demo's `/cancelled` page:

#### Header
- StagePass logo + "Powered by HitPay" badge (reuse from event ticketing)

#### Main Content (centered, max-width ~500px)
1. **Red X Icon** (circular red background, centered)
   - 20×20 white stroke icon, 2.5px width
   - Background: `bg-red-100`, container: 80×80px

2. **Heading** `<h1>`
   - "Subscription Cancelled"
   - `text-2xl font-bold text-gray-900`, centered

3. **Subtitle** `<p>`
   - Plan name if available: `"Your subscription to {planName} was not activated."`
   - Fallback: `"Your subscription was not activated."`
   - `text-sm text-gray-500`, centered, `opacity-75`

4. **"What you can do" Card** (white, bordered, rounded)
   - Bulleted list:
     - Try a different payment method
     - Check your payment details
     - Contact support if the issue persists
   - List items use red checkmark icons (matching icon style from event ticketing demo)

5. **"Set Up Another Subscription" Button**
   - Full-width, indigo background
   - Links to `/` (home page with plans list)
   - `bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl`

---

## 6. Success Screen (Enhanced)

### When Subscription is Created Successfully
Show full-page confirmation (inline or full-page, consistent with current flow).

#### Content
1. **Green Checkmark Icon** (circular green background, 80×80px container)

2. **Heading**
   - "Subscription Activated!"
   - `text-2xl font-bold text-gray-900`, centered

3. **Plan Details Card** (white, bordered, gradient header)
   - Header gradient: `from-indigo-500 to-purple-600`
   - Shows: Plan name, billing amount, interval, next charge date
   - Example: `"$29.99/month • Next charge: July 19, 2026"`

4. **"What's Next" Card** (white, bordered)
   - List of 3 items with checkmark icons:
     - First charge will be processed on {date}
     - You'll receive a confirmation email
     - Manage your subscription in your account
   - Checkmark icons: indigo background, white checkmarks

5. **"Set Up Another Subscription" Button**
   - Full-width, indigo background
   - Links to `/` (home page to select another plan)
   - `bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl`

---

## 7. Session State Restoration

### Problem
User selects plan → chooses payment method → redirected to payment provider (e.g., GrabPay) → comes back to app → state is lost, they see empty plans list.

### Solution
**Save checkout state to `sessionStorage` before redirect; restore on mount.**

#### Implementation

**Before redirect** (in CheckoutSection or payment handler):
```typescript
sessionStorage.setItem('hp_billing_state', JSON.stringify({
  planId: selectedPlan.id,
  currency,
  environment,
}));
window.location.href = paymentUrl;
```

**On page mount** (in `page.tsx` `useEffect`):
```typescript
useEffect(() => {
  const saved = sessionStorage.getItem('hp_billing_state');
  if (!saved) return;
  sessionStorage.removeItem('hp_billing_state'); // Remove after reading
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

#### Scope
- Saves only essential state (`planId`, `currency`, `environment`)
- Clears immediately after restore (one-time use)
- Gracefully fails if data is missing or invalid

---

## 8. Styling & Design System

### Alignment with Event Ticketing Demo
- **Colors:** Use same palette (indigo for primary, amber/green for status, red for errors)
- **Spacing:** Match padding/margin scale
- **Typography:** Same font sizes and weights
- **Buttons:** Same border radius (`rounded-xl`), padding (`py-3`), hover states
- **Cards:** `rounded-2xl border border-gray-200` with consistent shadows
- **Icons:** Consistent stroke widths, colors, sizing

### Specific Updates
- Header: Segmented control styling (new)
- Banners: Amber/green info bars (new)
- Cancelled & Success pages: Full-page layouts (already exist in event ticketing demo, adapt for billing context)
- PlansSection, CheckoutSection: Ensure card/button styles match

---

## 9. Files to Create/Update

### New Files
- `app/cancelled/page.tsx` — Cancelled subscription page
- `docs/design-2026-06-19-modern-refactor.md` — This spec

### Modified Files
- `.env.local.example` — Add `_PRODUCTION` keys and TH keys
- `.env.local` — Update with new keys (user's responsibility)
- `components/Header.tsx` — Segmented Sandbox/Live control
- `app/page.tsx` — Manage environment state, add banners, restore state
- `lib/payment-methods.ts` — Add THB/LinePay support
- `lib/plans.ts` — Add THB currency option
- `app/api/recurring-billing/route.ts` — Use environment-aware key lookup
- `components/CheckoutSection.tsx` — Save state before redirect
- `components/ResultCard.tsx` — Ensure it displays success/cancelled correctly
- Styling files (`app/globals.css`, component styles) — Minor tweaks for consistency

---

## 10. Success Criteria

- ✅ Segmented Sandbox/Live toggle in header works and persists across navigation
- ✅ Environment banners display correctly for each mode
- ✅ API calls use correct key set (sandbox vs production) based on UI selection
- ✅ THB/LinePay payment method appears when THB currency selected
- ✅ `/cancelled` page displays with plan name if provided
- ✅ Success screen shows subscription details and "Set Up Another" button
- ✅ Returning from payment redirect restores plan/currency/environment state
- ✅ Styling matches event ticketing demo (colors, spacing, components)
- ✅ All tests pass (existing tests may need light updates for new environment handling)

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|------|---|
| API routes fail if `environment` param missing | Add validation and default to `sandbox`; document required params |
| Session state `sessionStorage` data stale | Clear after reading; graceful fallback if missing |
| Styling inconsistencies | Compare pixel-by-pixel with event ticketing demo; use shared utility classes if possible |
| THB key not configured | Add clear error message if `HITPAY_API_KEY_TH` missing |

---

## 12. Appendix: Related Files

- Event ticketing demo: `/Users/thaisaramos/Sites/hitpay-event-ticketing-demo/`
- Reference implementation: Use Header.tsx, /cancelled/page.tsx, app/page.tsx as templates
