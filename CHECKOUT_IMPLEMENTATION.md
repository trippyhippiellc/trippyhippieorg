# 🛒 Checkout Implementation Guide

## Overview
The checkout flow in Trippy Hippie is a multi-step payment system that supports multiple payment methods.

## Payment Methods Implemented

### 1. **Cash App** 💵
- Direct QR code payment integration
- Uses `$TrippyHippieSmoke` Cash App handle
- User can copy handle or open Cash App with pre-filled amount
- Manual confirmation button after payment is sent
- Order created as "pending_payment" until confirmed

**Flow:**
1. User selects Cash App
2. Display QR code and Cash App handle
3. User sends payment
4. User clicks "Confirm Payment" button
5. Order created with status "pending_payment"
6. Redirect to `/account/orders`

### 2. **Stripe** 💳
- Credit/Debit card payments via Stripe.js
- PCI-compliant (Stripe handles card data)
- Branded card form matching Trippy Hippie design
- PaymentMethod created and passed to backend
- Order created with payment confirmed

**Flow:**
1. User selects Credit/Debit Card
2. Stripe Elements card form displayed
3. User enters card details
4. Form submitted to create PaymentMethod
5. Order created with `stripePaymentMethodId`
6. Redirect to `/account/orders`

**Environment Variables Required:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RSk7vC5LQMl6syhcUfeln8hmnRtYJnRrCuPPRlcSNFq7DM175WcFqJ6QLIju0Cn9FNxaylilOjGwB5WzAsEqZUM00ooSRuYrp
STRIPE_SECRET_KEY=[your-secret-key]
```

### 3. **Cryptocurrency** 🪙
- Status: **Coming Soon**
- Placeholder UI showing what will be available
- Future support for: Bitcoin, Ethereum, etc.
- Uses NowPayments or similar provider (scaffolded)

**Flow:**
1. User sees "Coming Soon" banner
2. Cannot proceed with crypto payment yet
3. Button to select different method

### 4. **Wire Transfer** 🏦
- Bank wire coordination flow
- Order created as "pending_payment"
- Email sent with wire transfer instructions
- Agent reaches out within 24 hours
- Order processing begins after payment received

**Flow:**
1. User selects Wire Transfer
2. Display wire payment information
3. User clicks "Send Me Wire Instructions"
4. Order created with status "pending_payment"
5. Email sent to user with bank details
6. Agent contacts user to coordinate
7. Redirect to `/account/orders`

**Environment Variables Required:**
```
WIRE_BANK_NAME=Your Bank Name
WIRE_ACCOUNT_NAME=Trippy Hippie Wholesale LLC
WIRE_ACCOUNT_NUMBER=XXXXXXXX
WIRE_ROUTING_NUMBER=XXXXXXXXX
```

## File Structure

```
src/
├── app/(main)/checkout/
│   ├── page.tsx              # Main checkout page with payment method selector
│   ├── layout.tsx            # Checkout layout wrapper
│   ├── stripe/               # Old Stripe redirect page (deprecated)
│   ├── crypto/               # Old crypto page (deprecated)
│   └── [payment_method]/     # Future: individual payment pages
│
├── components/checkout/
│   ├── page.tsx              # Main checkout page with payment method selector
│   ├── OrderSummary.tsx      # Order summary sidebar component
│   ├── PaymentMethodSelector.tsx  # Payment method button group
│   └── payments/
│       ├── CashAppPayment.tsx      # Cash App payment form
│       ├── StripePayment.tsx       # Stripe card form
│       ├── CryptoPayment.tsx       # Crypto coming soon
│       └── WirePayment.tsx         # Wire transfer coordinator
│
└── api/
    ├── orders/create/route.ts      # Create order endpoint
    └── emails/send-wire-instructions/route.ts  # Send wire instructions email
```

## Key Features

### Security
- ✅ All card data handled by Stripe (PCI-DSS compliant)
- ✅ No credit card data stored on Trippy Hippie servers
- ✅ SSL/TLS encryption for all communications
- ✅ Environment variables for sensitive data
- ✅ User authentication required for checkout

### User Experience
- ✅ Clean, intuitive payment method selection
- ✅ Real-time order summary
- ✅ Clear payment instructions for each method
- ✅ Success/error feedback with toast notifications
- ✅ Automatic redirect to orders page

### Payment Processing
- ✅ Cart validation before checkout
- ✅ Order creation with payment metadata
- ✅ Cart cleared on successful payment
- ✅ Order status tracking (pending_payment, processing, etc.)

## API Endpoints

### POST /api/orders/create
**Create a new order**

Request:
```json
{
  "paymentMethod": "cashapp" | "stripe" | "crypto" | "wire",
  "total": 99.99,
  "status": "pending_payment",
  "stripePaymentMethodId": "pm_1234567890" // Only for Stripe
}
```

Response:
```json
{
  "id": "order-uuid",
  "user_id": "user-uuid",
  "total": 99.99,
  "payment_method": "cashapp",
  "status": "pending_payment",
  "created_at": "2026-02-23T12:00:00Z"
}
```

### POST /api/emails/send-wire-instructions
**Send wire transfer instructions email**

Request:
```json
{
  "orderId": "order-uuid",
  "amount": 99.99
}
```

Response:
```json
{
  "message": "Wire instructions sent"
}
```

## Testing Payment Methods

### Local Testing Mode
1. Use test credentials for Stripe
2. Mock Cash App handle with environment variable
3. Wire transfer requires real bank details (use test values)

### Stripe Test Cards
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Require 3D Secure:** `4000 0025 0000 3155`
- **Expire:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits

## Environment Setup

Create `.env.local` with:

```bash
# Stripe (already added)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RSk7vC5LQMl6syhcUfeln8hmnRtYJnRrCuPPRlcSNFq7DM175WcFqJ6QLIju0Cn9FNxaylilOjGwB5WzAsEqZUM00ooSRuYrp
STRIPE_SECRET_KEY=sk_live_xxxxxxxx

# Cash App
NEXT_PUBLIC_CASHAPP_HANDLE=$TrippyHippieSmoke

# Wire Transfer
WIRE_BANK_NAME=Your Bank Name
WIRE_ACCOUNT_NAME=Trippy Hippie Wholesale LLC
WIRE_ACCOUNT_NUMBER=XXXXXXXX
WIRE_ROUTING_NUMBER=XXXXXXXXX
```

## Future Enhancements

- [ ] Actual Stripe charge processing (currently only creates PaymentMethod)
- [ ] Crypto payment integration with NowPayments
- [ ] Email sending via Resend for wire instructions
- [ ] Order tracking dashboard
- [ ] Payment status webhooks
- [ ] Refund management UI
- [ ] Invoice generation and PDF delivery
- [ ] Order history and receipts
- [ ] Payment plan support (installments)
- [ ] Discount code integration at checkout

## Troubleshooting

### Stripe Card Form Not Loading
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set correctly
- Check browser console for Stripe.js load errors
- Ensure production key has the right permissions

### Orders Not Being Created
- Verify user is authenticated (check auth context)
- Check Supabase connection and permissions
- Look for database schema issues in migrations
- Check server logs for Supabase errors

### Cash App Not Opening
- Verify `NEXT_PUBLIC_CASHAPP_HANDLE` is set
- Test format: `$Handle` (case-sensitive)
- Cash App must be installed on user's device

### Wire Instructions Email Not Sending
- Implement Resend integration for email sending
- Add email template HTML
- Test email delivery pipeline
- Add email retry logic

## Notes

- Delete `/stripe/page.tsx` and `/crypto/page.tsx` when old checkout is fully migrated
- Update cart clearing logic if needed
- Implement actual Stripe charge on backend
- Add phone verification for high-value orders
- Consider fraud detection/prevention
- Add order confirmation emails
- Implement payment webhooks
