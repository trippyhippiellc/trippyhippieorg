/*
  src/config/payments.ts
  Central config for all payment methods.
  Stripe, NOWPayments (crypto), Cash App, Wire transfer.
*/

export const paymentConfig = {
  stripe: {
    publishableKey:  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    currency:        "usd",
    /** Minimum order in cents for Stripe */
    minimumCents:    500,
    /** Webhook secret — server only */
    webhookSecret:   process.env.STRIPE_WEBHOOK_SECRET ?? "",
    successUrl:      "/checkout/success",
    cancelUrl:       "/checkout",
  },

  crypto: {
    apiKey:          process.env.NOWPAYMENTS_API_KEY ?? "",
    ipnSecret:       process.env.NOWPAYMENTS_IPN_SECRET ?? "",
    /** Accepted coins shown at checkout */
    acceptedCoins:   ["BTC", "ETH", "USDC", "USDT", "LTC"] as string[],
    /** NOWPayments sandbox mode */
    sandbox:         process.env.NODE_ENV !== "production",
    callbackUrl:     "/api/payments/crypto/callback",
    successUrl:      "/checkout/success",
    cancelUrl:       "/checkout",
  },

  cashApp: {
    handle:          process.env.NEXT_PUBLIC_CASHAPP_HANDLE ?? "$TrippyHippieSmoke",
    /** Instructions shown after order is placed */
    instructions: [
      "Open Cash App and tap the $ icon to send",
      "Enter the exact amount shown — no rounding",
      "Include your order number in the Note field",
      "Orders ship once payment is confirmed (usually within 2 hours)",
    ],
  },

  wire: {
    bankName:      process.env.NEXT_PUBLIC_WIRE_BANK_NAME    ?? "",
    accountName:   "Trippy Hippie Wholesale LLC",
    accountNumber: process.env.NEXT_PUBLIC_WIRE_ACCOUNT      ?? "",
    routingNumber: process.env.NEXT_PUBLIC_WIRE_ROUTING      ?? "",
    /** Minimum wire order in cents */
    minimumCents:  20000,
    instructions: [
      "Include your order number in the memo / reference field",
      "Processing takes 1–2 business days after funds clear",
      "Email support@trippyhippie.org once you have sent the wire",
    ],
  },

  /** All enabled payment methods in display order */
  enabledMethods: ["stripe", "crypto", "cashapp", "wire"] as const,

  /** Free shipping threshold in cents */
  freeShippingThresholdCents: 10000,

  /** Default shipping cost in cents */
  standardShippingCents: 995,
  expressShippingCents:  1995,
};

export type PaymentMethodId = typeof paymentConfig.enabledMethods[number];
