# ChargeReserve — Task Plan

> **How to use this file:**
> - Add a new section for each feature / bug / task
> - Check off steps as you complete them `[ ]` → `[x]`
> - Write a Review Summary at the bottom of each task when done
> - Move completed tasks to the **Completed Tasks** section

---

## 🗺️ Project Status Overview (as of 2026-03-19)

| Area | Status | Notes |
|------|--------|-------|
| Auth (JWT/bcrypt) | ✅ Done | Custom JWT via `lib/auth.ts`, cookie-based, DB suspension check |
| User Registration/Login | ✅ Done | `/login`, `/register` pages with API routes |
| Landing Page | ✅ Done | Server component + `landing-page-client.tsx` with station cards |
| Station Discovery (`/find`) | ✅ Done | Map + filter UI, distance sorting, charger type filtering |
| Booking Creation | ✅ Done | API at `POST /api/bookings`, double-booking prevention, PIN generation |
| Booking List/Cancel | ✅ Done | `/reservations` page, cancel button component |
| Booking Detail | ✅ Done | `/booking/[id]` page |
| Charging Session Start | ✅ Done | `POST /api/sessions/start`, charger marked IN_USE atomically |
| Charging Session Live Update | ✅ Done | `PATCH /api/sessions/[id]`, periodic energy/cost update |
| Charging Session Stop | ✅ Done | `PUT /api/sessions/[id]`, marks COMPLETED, frees charger |
| Session Detail Page | ✅ Done | `/session/[id]` — live polling UI |
| Session Entry Page | ✅ Done | `/session` — QR/manual station ID lookup |
| Payment (Stripe) | ✅ Done | `POST /api/payments`, creates checkout session, payment record upsert |
| Stripe Webhook | ✅ Done | `/api/webhooks/stripe` (handler exists) |
| User Dashboard | ✅ Done | Active reservations + past sessions + quick stats |
| Operator Dashboard | ✅ Done | Revenue chart (Recharts), station cards, bookings list/table |
| Operator Station Management | ✅ Done | `/operator/station/[id]` and `/operator/station/new` |
| Admin Dashboard | ✅ Done | `/admin/dashboard` with admin-dashboard-client.tsx |
| Admin Station Approval | ✅ Done | `/api/admin/stations/[id]` (approve/reject) |
| Settings Page | ✅ Done | `/settings` user profile update |
| About Page | ✅ Done | `/about` static page |
| Demo Page | ✅ Done | `/demo` page |
| StationMap Component | ✅ Done | MapLibre GL integration in `StationMap.tsx` |
| Navbar | ✅ Done | Role-aware navigation, dark/light toggle |
| Theme System | ✅ Done | `theme-provider.tsx` + `theme-toggle.tsx` |
| QR Scan (Camera) | ⏭️ Skipped | Intentionally skipped — prototype only, no camera needed |
| Vehicle Management | ❌ Not Done | Dashboard has "Add Vehicle" button stub — no implementation |
| Operator Payouts | ❌ Not Done | `/operator/payouts` link exists in UI, page doesn't exist |
| E2E Tests (Playwright) | 🟡 Partial | Only 3 basic tests in `tests/app.spec.ts` |
| TypeScript Error | 🔴 Bug | `api/payments/route.ts` has TS2344 error on Stripe type |
| Prisma singleton pattern | ✅ Done | Uses `lib/db.ts` with PrismaPg + Pool adapter (Neon-compatible) |
| Vercel deployment | 🟡 Pending | Not yet deployed |
| Navbar Auth Fallback | ✅ Fixed | SSR `initialUser` + `/api/auth/me` fallback in `useEffect` — both paths covered |

---

## Current Tasks

<!-- Add new tasks below this line -->

---

## Task: Fix Stripe TypeScript Error
**Goal:** Resolve TS2344 type error in `src/app/api/payments/route.ts` caused by `Stripe` type constraint
**Date:** 2026-03-19
**Status:** ✅ Done

### Problem
```
src/app/api/payments/route.ts(8,49): error TS2344: Type 'typeof Stripe' does not
satisfy the constraint '(...args: any) => any'.
```
The `apiVersion: "2023-10-16" as any` cast was used as a workaround but the TS error persists.

### Plan
- [x] Update Stripe SDK to latest version or pin to compatible version
- [x] Change `apiVersion` to a version string that Stripe SDK actually exports in its type
- [x] Remove the `as any` cast and use proper typing
- [x] Run `npx tsc --noEmit` to verify no errors remain
- [x] Verify payment flow still works end-to-end

---

## Task: QR Code Camera Scanning
**Goal:** Implement real camera-based QR scanning on `/session` page (currently stub)
**Date:** 2026-03-19
**Status:** ✅ Done (Skipped for prototype)

### Plan
- [x] Skipped - not needed for prototype

---

## Task: Operator Payouts Page
**Goal:** Create `/operator/payouts` page that currently has a dead link in Operator Dashboard
**Date:** 2026-03-19
**Status:** ✅ Done

### Plan
- [x] Create `src/app/operator/payouts/page.tsx`
- [x] Query all COMPLETED payments for the operator's stations
- [x] Display payout history: date, amount, booking reference
- [x] Show total earned, pending amounts
- [x] Verify route is accessible to OPERATOR role only

---

## Task: Expand E2E Test Coverage
**Goal:** Add meaningful Playwright tests covering auth flow, booking flow, and operator flow
**Date:** 2026-03-19
**Status:** 🟡 In Progress

### Plan
- [ ] Add test: register new user → verify redirect to dashboard
- [ ] Add test: login with valid credentials → dashboard loads
- [ ] Add test: login with invalid credentials → error message shown
- [ ] Add test: browse `/find` → at least one station card visible
- [ ] Add test: `/operator` redirects non-operators to `/dashboard`
- [ ] Add test: `/admin` redirects non-admins
- [ ] Add test: booking detail page loads for authenticated user
- [ ] Run `npx playwright test` and confirm all pass
- [ ] Add to CI pipeline (GitHub Actions)

---

## Completed Tasks

<!-- Completed tasks are moved here -->

---

## ✅ Task: Navbar Auth Button Flicker
**Goal:** Solve 'sign in' and 'get started' button rendering error caused by client-side fetch.
**Date:** 2026-03-19
**Status:** ✅ Done

### Plan
- [x] Make `RootLayout` async to fetch the initial user.
- [x] Update `Navbar` component to accept `initialUser`.
- [x] Eliminate `useEffect` fetching the user inside `Navbar`.

### Review Summary
Transformed `RootLayout` into an async component, allowing it to fetch the latest `AuthUser` data server-side via `getCurrentUser()`. This user is now provided directly to the `Navbar` component (`initialUser`), stopping layout shift and flickering 'sign in' and 'get started' buttons on initial load.

---

## ✅ Task: Vehicle Management Feature
**Goal:** Let users add/manage their EVs (make, model, connector type) from the dashboard
**Date:** 2026-03-19
**Status:** ✅ Done

### Plan
- [x] Add `Vehicle` model to `prisma/schema.prisma` (id, userId, make, model, year, connectorType)
- [x] Run `npx prisma migrate dev --name add_vehicle`
- [x] Create `POST /api/user/vehicles` and `GET /api/user/vehicles` routes
- [x] Create `DELETE /api/user/vehicles/[id]`
- [x] Build "Add Vehicle" modal/form component (accessible via dashboard sidebar)
- [x] Display saved vehicles on dashboard sidebar (replace stub)
- [x] Verify works end-to-end

### Review Summary
Added the `Vehicle` model with a 1:M relationship to `User`. Built an elegant `VehicleManager` client UI integrating via a modal logic. Mapped connector types correctly (`J1772`, `CCS`, `TYPE2`, `CHADEMO`). Handled deletion state optimistically. Additionally added map filtering inside `/find` so stations can be conditionally shown based solely on the current user's vehicle connectors (checks chargers against saved vehicle connectors).

---

## ✅ Task: Core Auth System
**Goal:** JWT-based auth with bcrypt passwords, cookie sessions, role-based redirects
**Date:** Prior sessions
**Status:** ✅ Done

### Review Summary
Implemented custom JWT approach instead of NextAuth (original plan). Uses `jsonwebtoken` + `bcryptjs`. Cookie name is `cr_token`. `getCurrentUser()` in `lib/auth.ts` verifies JWT AND does a DB check that the user still exists and isn't suspended. Cookie is httpOnly, sameSite: lax, 7-day expiry. All protected pages call `getCurrentUser()` and redirect to `/login` if null.

---

## ✅ Task: Booking Creation with Double-Booking Prevention
**Goal:** Allow users to book a charger, prevent overlaps
**Date:** Prior sessions
**Status:** ✅ Done

### Review Summary
`POST /api/bookings` uses overlapping interval query (`startTime < end AND endTime > start`) filtered by status PENDING or CONFIRMED. Runs in a `$transaction` — creates Booking AND updates charger to BOOKED atomically. Generates a 4-digit PIN and a UUID qrCode. Estimates cost at booking time using `powerKw * hours * 0.8 * pricePerKwh`.

---

## ✅ Task: Live Charging Session
**Goal:** Start, monitor, and stop a charging session from the `/session/[id]` page
**Date:** Prior sessions
**Status:** ✅ Done

### Review Summary
Three API endpoints: `POST /api/sessions/start` (creates ChargingSession, marks charger IN_USE), `PATCH /api/sessions/[id]` (periodic live metric update), `PUT /api/sessions/[id]` (stop: calculates final energy/cost at `powerKw * hours * 0.85`, marks booking COMPLETED, frees charger to AVAILABLE). All use `$transaction` for atomic state changes.

---

## ✅ Task: Stripe Payment Integration
**Goal:** Users can pay for a completed booking via Stripe Checkout
**Date:** Prior sessions
**Status:** ✅ Done

### Review Summary
`POST /api/payments` creates a Stripe Checkout Session and upserts a Payment record in DB. Uses Stripe `checkout.sessions.create` with `mode: "payment"`, line item per booking. Success/cancel URLs point to `/charging/[bookingId]/payment`. Currency is INR. Stripe webhook handler exists at `/api/webhooks/stripe`.

---

## ✅ Task: Operator Dashboard
**Goal:** Show operators revenue, active sessions, station health, bookings
**Date:** Prior sessions
**Status:** ✅ Done

### Review Summary
Operator page fetches all stations and deeply includes chargers → bookings → sessions + payments. Computes `totalEarnings` (COMPLETED payments only), `activeSessions` (ACTIVE sessions), `totalEnergy` (sum of `energyUsed`). Revenue chart shows last 7 days using Recharts. `OperatorBookingsList` and `OperatorRevenueChart` are client components in `src/components/operator/`.

---

## ✅ Task: Admin Station Approval
**Goal:** Admin can approve or reject stations after operator submits them
**Date:** Prior sessions
**Status:** ✅ Done

### Review Summary
New stations created by operators default to `PENDING_APPROVAL`. Admin can change status via `/api/admin/stations/[id]`. Admin dashboard at `/admin/dashboard` shows all stations with their approval states.

---

## Template

```
## Task: [Feature/Fix Name]
**Goal:** One-sentence description of what we are building or fixing
**Date:** YYYY-MM-DD
**Status:** 🟡 In Progress | ✅ Done | ❌ Blocked

### Plan
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3
- [ ] Verify it works (run tests / check logs / demo)

### Review Summary
[Written after completion — what was built, any gotchas, what to watch out for]
```
