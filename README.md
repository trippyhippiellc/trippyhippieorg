# Trippy Hippie — Full-Stack Hemp E-Commerce Platform

> Next.js 14 · Supabase · Tailwind · Zustand · Stripe · Crypto · CashApp · Wire

---

## Critical Setup Notes

**Home page location** — must be `src/app/(main)/page.tsx`. Delete `src/app/page.tsx`.

**SQL Migrations** (run in Supabase SQL Editor in order):
1. `001_initial_schema.sql` (FIXED version — `business_references` column)
2. `002_rls_policies.sql`
3. `003_functions.sql`

**Types fix** — `src/types/supabase.ts` must have `business_references` not `references` in wholesale_applications Row/Insert.

---

## Complete File Map

```
src/app/
├── (main)/
│   ├── layout.tsx                    ← [x] Main layout
│   ├── page.tsx                      ← [x] Home page (hero, categories, features, CTA)
│   ├── shop/
│   │   ├── page.tsx                  ← [x] Shop page
│   │   └── loading.tsx               ← [x] FIXED
│   ├── product/[id]/page.tsx         ← [x] Product detail (server)
│   ├── checkout/
│   │   ├── layout.tsx                ← [x] NEW
│   │   └── page.tsx                  ← [x] NEW — address + payment + summary
│   ├── apply-wholesale/page.tsx      ← [x] FIXED — business_references
│   ├── apply-affiliate/page.tsx      ← [x] FIXED — correct insert fields
│   ├── account/
│   │   ├── layout.tsx                ← [x] FIXED — isLoading
│   │   ├── page.tsx                  ← [x] Dashboard
│   │   ├── orders/page.tsx           ← [x]
│   │   ├── profile/page.tsx          ← [x] FIXED
│   │   ├── verify-id/page.tsx        ← [x] NEW — ID upload
│   │   └── affiliate/page.tsx        ← [x] NEW — earnings + referral code
│   ├── about/page.tsx                ← [x]
│   ├── faq/page.tsx                  ← [x]
│   ├── contact/page.tsx              ← [x]
│   ├── privacy/page.tsx              ← [x]
│   └── terms/page.tsx                ← [x]
├── (auth)/
│   ├── layout.tsx                    ← [x]
│   ├── login/page.tsx                ← [x]
│   ├── register/page.tsx             ← [x]
│   └── forgot-password/page.tsx      ← [x]
├── layout.tsx                        ← [x]
├── globals.css                       ← [x]
├── loading.tsx                       ← [x]
├── error.tsx                         ← [x]
└── not-found.tsx                     ← [x]

src/components/
├── ui/
│   ├── Button.tsx                    ← [x]
│   ├── Input.tsx                     ← [x]
│   ├── Select.tsx                    ← [x]
│   ├── Modal.tsx                     ← [x]
│   ├── Drawer.tsx                    ← [x]
│   ├── Spinner.tsx                   ← [x]
│   ├── StarRating.tsx                ← [x]
│   ├── Badge.tsx                     ← [x]
│   ├── Tooltip.tsx                   ← [x]
│   ├── Toast.tsx                     ← [x]
│   └── Skeleton.tsx                  ← [x] NEW
├── layout/
│   ├── Navbar.tsx                    ← [x] REBUILT
│   ├── Footer.tsx                    ← [x] REBUILT
│   └── MobileMenu.tsx                ← [x] REBUILT — full drawer
├── modals/
│   ├── AgeGateModal.tsx              ← [x]
│   └── StateSelectorModal.tsx        ← [x]
├── product/
│   ├── ProductCard.tsx               ← [x] FIXED
│   ├── ProductGrid.tsx               ← [x]
│   ├── ProductFilters.tsx            ← [x]
│   ├── ProductDetailClient.tsx       ← [x] NEW — gallery, qty, variants
│   ├── QuantitySelector.tsx          ← [x]
│   ├── AddToCartButton.tsx           ← [x] FIXED
│   ├── BulkPricingTiers.tsx          ← [x]
│   ├── ReviewList.tsx                ← [x] NEW — paginated reviews
│   └── ReviewForm.tsx                ← [x] NEW — star rating submission
├── cart/
│   ├── CartWidget.tsx                ← [x]
│   ├── CartItem.tsx                  ← [x]
│   ├── CartEmpty.tsx                 ← [x]
│   ├── CartSummary.tsx               ← [x]
│   └── CouponField.tsx               ← [x]
├── checkout/
│   ├── AddressForm.tsx               ← [x] NEW
│   ├── PaymentSelector.tsx           ← [x] NEW — Stripe/Crypto/CashApp/Wire
│   ├── CheckoutOrderSummary.tsx      ← [x] NEW
│   ├── CashAppPayment.tsx            ← [x] NEW — copy handle + instructions
│   └── WirePayment.tsx               ← [x] NEW — bank details + memo
└── auth/
    ├── LoginForm.tsx                 ← [x]
    ├── RegisterForm.tsx              ← [x]
    └── ForgotPasswordForm.tsx        ← [x]

src/config/
├── site.ts                           ← [x] UPDATED — cashAppHandle
├── navigation.ts                     ← [x]
└── productCategories.ts              ← [x]

src/types/
└── supabase.ts                       ← [x] FIXED — business_references

src/lib/utils/
└── cn.ts                             ← [x] formatCurrency, formatDate, slugify

supabase/migrations/
├── 001_initial_schema.sql            ← [x] FIXED
├── 002_rls_policies.sql              ← [x]
└── 003_functions.sql                 ← [x]
```

---

## Pending

- [ ] Admin panel (products CRUD, order management, application approvals)
- [ ] Stripe checkout (`/checkout/stripe`, `/api/stripe/create-session`)
- [ ] NOWPayments crypto (`/checkout/crypto`, `/api/crypto/create-invoice`)
- [ ] Blog (list + detail)
- [ ] Community forum (threads + replies)
- [ ] COA / Lab Results page
- [ ] Email system (Resend)
- [ ] Order detail page (`/account/orders/[id]`)

---

## Env Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://njmbfevorsonsdunpwxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CASHAPP_HANDLE=$TrippyHippieSmoke
NEXT_PUBLIC_WIRE_BANK_NAME=
NEXT_PUBLIC_WIRE_ACCOUNT=
NEXT_PUBLIC_WIRE_ROUTING=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NOWPAYMENTS_API_KEY=
RESEND_API_KEY=
```