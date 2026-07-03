# HitPay Recurring Billing Demo

A demo web app showing how to integrate [HitPay's embedded recurring billing API](https://docs.hitpayapp.com/apis/guide/embedded-recurring-billing).

Supported markets: **SGD** (Singapore), **MYR** (Malaysia), **PHP** (Philippines), **VND** (Vietnam via ZaloPay cross-border)

## Prerequisites

- Node.js 18+
- HitPay sandbox API keys for each market (obtain from your HitPay dashboard)

## Setup

1. Clone the repo and install dependencies:

   ```
   npm install
   ```

2. Copy the environment template:

   ```
   cp .env.local.example .env.local
   ```

3. Open `.env.local` and fill in your HitPay sandbox API keys:

   ```
   HITPAY_API_KEY_SG=your_sg_key_here
   HITPAY_API_KEY_MY=your_my_key_here
   HITPAY_API_KEY_PH=your_ph_key_here
   ```

4. Start the dev server:

   ```
   npm run dev
   ```

5. Open http://localhost:3000

## How it works

1. **Select a currency** in the top-right dropdown — plan prices update instantly using hardcoded FX rates, and payment methods filter to those supported by that currency.
2. **Pick a plan** — the checkout section appears.
3. **Fill in customer details** and select a payment method.
4. **Submit** — the app calls your Next.js API route (`/api/recurring-billing`), which picks the correct market API key server-side and calls HitPay.
5. **The result** renders inline: a QR code for ZaloPay, a link button for Shopee Pay/GrabPay/TNG, or step-by-step banking instructions for GIRO.

## Payment method / API key mapping

| Currency | Methods | API Key |
|----------|---------|---------|
| SGD | Shopee Pay, GrabPay, GIRO | HITPAY_API_KEY_SG |
| MYR | Shopee Pay, GrabPay, Touch 'N Go | HITPAY_API_KEY_MY |
| PHP | Shopee Pay | HITPAY_API_KEY_PH |
| VND | ZaloPay (cross-border) | HITPAY_API_KEY_SG |

## Running tests

```
npm test
```
