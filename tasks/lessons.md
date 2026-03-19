# ChargeReserve — Lessons Learned

> **How to use this file:**
> - After **ANY correction from the user**, add a new lesson here
> - Write a rule to prevent the same mistake in the future
> - **Review this file at the start of every session** for this project
> - The goal: ruthlessly iterate until the mistake rate drops to zero

---

## Session Review Checklist

Before starting any work, quickly scan the lessons below:
- [ ] Auth patterns reviewed (JWT, not NextAuth)
- [ ] DB singleton pattern reviewed (`lib/db.ts` not `lib/prisma.ts`)
- [ ] Prisma schema enums reviewed
- [ ] Transaction pattern for atomic state changes reviewed
- [ ] Charger lifecycle reviewed (AVAILABLE → BOOKED → IN_USE → AVAILABLE)
- [ ] Role-based routing rules reviewed
- [ ] Stripe apiVersion TS issue noted
- [ ] Any recurring mistakes noted

---

## ⚠️ Critical Project Deviations from CLAUDE.md

These are places where THIS project diverges from what CLAUDE.md documents. Read before every session.

### 1. Auth is Custom JWT — NOT NextAuth
The CLAUDE.md says `Auth: NextAuth.js` but **the actual implementation uses custom JWT (`jsonwebtoken`) + bcrypt**.
- Auth file: `src/lib/auth.ts`
- Cookie name: `cr_token`
- Entry point: `getCurrentUser()` — always call this, **never use `auth()` from NextAuth**
- `getCurrentUser()` verifies token AND checks `isSuspended` in DB on every call

### 2. Prisma Client is at `lib/db.ts` — NOT `lib/prisma.ts`
CLAUDE.md says `src/lib/prisma.ts` but the actual file is `src/lib/db.ts`.
- Import as: `import { prisma } from "@/lib/db";`
- **Never** `import { prisma } from "@/lib/prisma"` — that file does not exist

### 3. Prisma uses PrismaPg Adapter (Neon DB)
Not vanilla Prisma. Uses `@prisma/adapter-pg` with a `Pool` connection:
```ts
new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
})
```
This is required for Neon DB (serverless PostgreSQL).

---

## Lessons

<!-- Add new lessons below after each correction from the user -->

---

## Lesson: Navbar Shows "Sign In" Even When User Is Logged In
**Date:** 2026-03-19  
**Status:** ✅ Resolved (after multiple attempts — see below)

### What Went Wrong
The `RootLayout` calls `getCurrentUser()` server-side and passes `initialUser` to `<Navbar>`. `getCurrentUser()` does a **Prisma DB check** (`prisma.user.findUnique`) inside a `try/catch`. If that DB call silently fails or times out (common with serverless Neon cold starts), it returns `null` → `initialUser` is null → Navbar shows "Sign In" even for a logged-in user.

### Intermediate Fix (Wrong)
First attempt: added a client-side `useEffect` fallback in Navbar that calls `/api/auth/me` when `initialUser` is null. **This caused a new problem:** `/api/auth/me` also called `getCurrentUser()` (with DB check) and returned 401, spamming `GET /api/auth/me 401` on every page load because the DB check was still failing.

### Root Cause (Final)
The problem was never about the navbar — it was about `getCurrentUser()` doing an unnecessary DB round-trip in the **layout** for what only needed a JWT decode.

### Final Fix ✅
1. **Added `getUserFromToken()` to `auth.ts`** — a JWT-only decode with NO DB call, fast and reliable:
   ```ts
   export async function getUserFromToken(): Promise<JwtPayload | null> {
     const token = await getTokenFromCookie();
     if (!token) return null;
     return verifyToken(token); // JWT exp/sig only — no DB
   }
   ```
2. **`layout.tsx` uses `getUserFromToken()`** (not `getCurrentUser()`) for the navbar `initialUser` prop.
3. **Navbar `useEffect` simplified** back to just syncing the prop — no fallback fetch needed.

Protected pages (dashboard, etc.) still use `getCurrentUser()` with the DB check for proper suspension checks.

### Rules to Prevent It
- **Never do a DB call in layout.tsx** just to populate the navbar. JWT decode is sufficient.
- Keep `getCurrentUser()` (with DB) for pages that need it; use `getUserFromToken()` (JWT only) for layout/navbar.
- If you add a "fallback fetch" workaround, check if the fallback API also calls the same failing function — you'll just get a 401 loop.
- Think "what is the simplest thing that could work?" before adding complexity.

### Tags
#auth #navbar #nextjs #ssr #cookies #jwt #layout

---

## Lesson: Update Task Tracking Files Automatically
**Date:** 2026-03-19
**Trigger:** User had to remind me to update the tasks files (`todo.md`, `lessons.md`) after completing a major task.

### What Went Wrong
I successfully completed the Vehicle Management feature but failed to update the tracking documents automatically.

### Root Cause
I neglected the administrative requirements outlined in `todo.md` and `lessons.md` after focusing entirely on the code completion.

### Rule to Prevent It
- **Always update `todo.md` immediately upon completing a task.** 
- Move completed items to Completed Tasks, update status overview tables, check off boxes `[x]`, and add a Review Summary.
- Keep `lessons.md` updated as well whenever there is a learning moment.
- Do this *before* confirming with the user that the task is fully finished.

### Tags
#process #documentation #task-tracking

---

## Lesson: Auth Library is Custom JWT, Not NextAuth
**Date:** 2026-03-19
**Trigger:** Codebase analysis revealed NextAuth was never implemented despite being in the tech stack plan.

### What Went Wrong
The initial plan called for NextAuth.js but the actual implementation used custom JWT + bcrypt.

### Root Cause
Decision was made during implementation to use custom JWT for simplicity and full control over the auth flow (roles, cookies, payload shape).

### Rule to Prevent It
- **Always check `lib/auth.ts` first before writing any auth-related code.**
- `getCurrentUser()` returns `JwtPayload | null` — not a next-auth session object
- The `JwtPayload` shape is `{ userId, email, role, name }`
- Never try to use `getServerSession()` or `auth()` — those are NextAuth APIs

### Tags
#auth #jwt #architecture-deviation

---

## Lesson: Prisma Import Path Gotcha
**Date:** 2026-03-19
**Trigger:** Codebase analysis — `lib/db.ts` not `lib/prisma.ts`

### What Went Wrong
CLAUDE.md documents `src/lib/prisma.ts` as the Prisma client but the real file is `src/lib/db.ts`.

### Root Cause
File was named differently during implementation.

### Rule to Prevent It
- **Always import Prisma as:** `import { prisma } from "@/lib/db";`
- If `lib/prisma.ts` doesn't exist, don't create it — use `lib/db.ts`

### Tags
#database #prisma #import

---

## Lesson: Charger Status Lifecycle — Always Use Transactions
**Date:** 2026-03-19
**Trigger:** Codebase analysis of booking, session start, and session stop patterns.

### What Went Wrong
(Preventive lesson) — if `charger.status` is updated without a transaction alongside the booking/session update, race conditions can occur.

### Root Cause
Charger status changes (BOOKED, IN_USE, AVAILABLE) must be atomic with the corresponding record change.

### Rule to Prevent It
**Always use `$transaction` for these pairs:**
1. Create Booking → Update Charger to `BOOKED`
2. Create ChargingSession → Update Charger to `IN_USE`
3. Complete ChargingSession → Update Booking to `COMPLETED` → Update Charger to `AVAILABLE`

Never update charger status in isolation outside of a transaction.

### Tags
#database #transactions #charger-lifecycle

---

## Lesson: Stripe apiVersion Has a TypeScript Error
**Date:** 2026-03-19
**Trigger:** TS error found in `build_errors.txt` and `ts_errors_utf8.txt`

### What Went Wrong
```
src/app/api/payments/route.ts(8,49): error TS2344: Type 'typeof Stripe' does not
satisfy the constraint '(...args: any) => any'.
```
Using `apiVersion: "2023-10-16" as any` compiles at runtime but TypeScript is unhappy with the `as any` cast on the `apiVersion` field.

### Root Cause
Stripe's TypeScript types for `apiVersion` are very strict — only specific version strings from their union type are accepted.

### Rule to Prevent It
- Use a version string that Stripe SDK 20.x actually exports (check `Stripe.LatestApiVersion`)
- Or use: `apiVersion: "2024-11-20.acacia"` (or whatever is Stripe.LatestApiVersion for current SDK)
- Do NOT use `as any` for apiVersion without a comment
- After changing: run `npx tsc --noEmit` to confirm clean

### Tags
#typescript #stripe #payments

---

## Lesson: Double-Booking Prevention Query Pattern
**Date:** 2026-03-19
**Trigger:** Codebase analysis of booking creation logic.

### What Went Wrong
(Preventive lesson) — naïve overlap checks miss edge cases.

### Root Cause
Time overlap detection requires the right query: `startTime < requestedEnd AND endTime > requestedStart`.

### Rule to Prevent It
**The correct overlapping interval query for Prisma:**
```ts
const overlap = await prisma.booking.findFirst({
  where: {
    chargerId,
    status: { in: ["PENDING", "CONFIRMED"] },
    AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
  },
});
```
Use this exact pattern. Do not use `gte`/`lte` — they miss touching intervals.

### Tags
#database #bookings #business-logic

---

## Lesson: Role-Based Route Guards
**Date:** 2026-03-19
**Trigger:** Codebase analysis of operator and admin pages.

### What Went Wrong
(Preventive lesson) — missing role checks can expose operator/admin pages to regular users.

### Root Cause
Role checks are manual on each page — there's no global middleware enforcing this.

### Rule to Prevent It
**Always add role checks at the top of protected pages:**
```ts
const user = await getCurrentUser();
if (!user) redirect("/login");
if (user.role !== "OPERATOR" && user.role !== "ADMIN") redirect("/dashboard");
```
- Operator pages: `role === "OPERATOR" || role === "ADMIN"`
- Admin pages: `role === "ADMIN"` only
- User pages: `user` exists (any role gets in)

### Tags
#auth #roles #security

---

## Lesson: QR Scan Feature is a Stub — Don't Trust the UI
**Date:** 2026-03-19
**Trigger:** Codebase analysis of `/session` page.

### What Went Wrong
The `/session` page has a "Scan QR" tab button and a placeholder UI, but pressing "Enable Camera" does nothing — there is NO actual QR scanning implementation.

### Root Cause
Stub UI was built first, real camera integration was deferred.

### Rule to Prevent It
- If building QR scanning, use `@zxing/browser` or `html5-qrcode`
- The QR code value on each booking is `booking.qrCode` (UUID format)
- The session entry page must match scanned value against `booking.qrCode` or `charger.id`
- **Do not tell users QR scanning works until real implementation is in place.**

### Tags
#feature-stub #qr #session

---

## Lesson: `src/lib/db.ts` Uses `@ts-expect-error` — This is Intentional
**Date:** 2026-03-19
**Trigger:** Codebase analysis of `src/lib/db.ts`

### What Went Wrong
(Preventive lesson) — seeing `@ts-expect-error` and thinking it needs to be fixed.

### Root Cause
There's a types version mismatch between `@types/pg` and `@prisma/adapter-pg`. This is a known upstream issue. The workaround comment explains this explicitly.

### Rule to Prevent It
- **Do not remove the `@ts-expect-error` comment in `lib/db.ts`.** It is intentional and documented.
- If Prisma or `@prisma/adapter-pg` is upgraded, re-test if the error still holds.

### Tags
#typescript #prisma #known-issue

---

## Lesson: Charger Status vs. Booking Status — Two Different Concepts
**Date:** 2026-03-19
**Trigger:** Codebase analysis of schemas and API routes.

### What Went Wrong
(Preventive lesson) — confusing charger status and booking status.

### Root Cause
The system has two separate status fields that must stay in sync:
- `Charger.status`: `AVAILABLE | BOOKED | IN_USE | MAINTENANCE`
- `Booking.status`: `PENDING | CONFIRMED | CANCELLED | COMPLETED`

### Rule to Prevent It
**Lifecycle mapping:**
| Event | Charger.status | Booking.status |
|-------|---------------|----------------|
| Booking created | → BOOKED | → CONFIRMED |
| Session started | → IN_USE | (stays CONFIRMED) |
| Session stopped | → AVAILABLE | → COMPLETED |
| Booking cancelled | → AVAILABLE | → CANCELLED |

Always update BOTH in a transaction. Never update just one.

### Tags
#database #charger-lifecycle #booking-lifecycle

---

## Lesson: Cost Estimation — Two Different Efficiency Factors
**Date:** 2026-03-19
**Trigger:** Codebase analysis of booking vs. session stop logic.

### What Went Wrong
(Preventive lesson) — inconsistent efficiency factors between quote and actual.

### Root Cause
- **Booking creation** estimates cost with `powerKw * hours * 0.8` (80% efficiency)
- **Session stop** calculates actual cost with `powerKw * hours * 0.85` (85% efficiency)

This means the quoted cost ≠ actual cost. This is intentional but worth knowing.

### Rule to Prevent It
- The `0.8` factor in booking is for user-facing cost estimate (conservative lower bound)
- The `0.85` factor in session stop is the "actual" calculation
- If you change one, consider whether the other should be updated too
- Document the reason for the discrepancy in code comments

### Tags
#business-logic #payments #sessions

---

## Lesson: Vehicle Management is Not Implemented Despite Dashboard UI
**Date:** 2026-03-19
**Trigger:** Codebase analysis — "Add Vehicle" button in dashboard sidebar is non-functional.

### What Went Wrong
The dashboard has a "My Vehicles" card with an "Add Vehicle" button that does nothing.

### Root Cause
Feature was scoped for a later sprint and the button was placed as a placeholder.

### Rule to Prevent It
- The `User` model has `vehicleType: String?` — a single string, not a full vehicle model
- A proper `Vehicle` model needs to be added to schema before implementing this feature
- The button must not mislead users — either implement it or hide it

### Tags
#feature-stub #dashboard #vehicles

---

## Lesson: Operator Payouts Page is a Dead Link
**Date:** 2026-03-19
**Trigger:** Codebase analysis — `/operator/payouts` linked in Operator Dashboard but no page exists.

### What Went Wrong
`/operator/page.tsx` has a "Manage Payouts" button linking to `/operator/payouts` but no such page exists.

### Root Cause
Feature was planned but not implemented.

### Rule to Prevent It
- Don't add navigation links until the destination page is built
- If adding the link early, use a `TODO` comment and check status prop
- Create `src/app/operator/payouts/page.tsx` before pointing users there

### Tags
#feature-stub #operator #payments

---

## Lesson: Playwright Tests Only Cover 3 Basic Scenarios
**Date:** 2026-03-19
**Trigger:** Codebase analysis of `tests/` directory.

### What Went Wrong
The test suite is almost empty — only 3 tests: page title, about page, and dashboard redirect.

### Root Cause
Testing was deferred during initial development.

### Rule to Prevent It
- Any new feature should come with at least one E2E test
- Run `npx playwright test` before claiming something "works"
- The test file is at `tests/app.spec.ts` — add to it, don't create random test files
- Use `npx playwright show-report` to see results in browser

### Tags
#testing #playwright #quality

---

## Lesson: `useEffect` for Data Fetching is Forbidden — Check Session Page
**Date:** 2026-03-19
**Trigger:** CLAUDE.md anti-patterns + codebase analysis of session page.

### What Went Wrong
The `/session/[id]` page likely uses polling (intervalId + fetch) which is a form of `useEffect` data fetching that's acceptable ONLY for live real-time updates, not initial data loads.

### Root Cause
Real-time session monitoring genuinely needs periodic polling since Server Components can't push updates.

### Rule to Prevent It
- `useEffect` + `setInterval` polling for live session metrics = **acceptable** (no other choice)
- `useEffect` + `fetch` for initial page data = **never** (use Server Component instead)
- If moving session page to server component, use React Suspense + streaming instead

### Tags
#nextjs #react #anti-patterns

---

## Lesson: Station Status Must Be ACTIVE for Bookings to Succeed
**Date:** 2026-03-19
**Trigger:** Codebase analysis of booking creation logic.

### What Went Wrong
(Preventive lesson) — if a station is `PENDING_APPROVAL` or `INACTIVE`, booking attempts return a 400 error.

### Root Cause
Booking validation at `POST /api/bookings` checks `charger.station.status !== "ACTIVE"`.

### Rule to Prevent It
- Seeds and test data must use `status: "ACTIVE"` stations for booking tests to pass
- Admin must approve stations before users can book from them
- The `StationStatus` enum: `PENDING_APPROVAL | ACTIVE | INACTIVE`

### Tags
#business-logic #stations #admin

---

## Lesson: Avoid Layout Shift with Client-Side Auth Checks
**Date:** 2026-03-19
**Trigger:** Sign In buttons erroneously appearing while Next.js fetched user state asynchronously on the client-end.

### What Went Wrong
The `Navbar` rendered default login buttons ("Sign In" and "Get Started") to the user before the internal `useEffect` completed its `/api/auth/me` request.

### Root Cause
Performing initial authentication checks entirely on the client-side, causing layout shift and rendering elements dynamically out-of-order. This violates the CLAUDE.md anti-pattern: *Do not use useEffect for data fetching*.

### Rule to Prevent It
- **Pass server fetched state into client initial state:** When possible, leverage parent Next.js Server Components (like `layout.tsx`) to supply `<Navbar>` with an `initialUser` that corresponds strictly to `await getCurrentUser()`.
- Wait on server before rendering the page so hydrated components never start unauthenticated if they aren't.

### Tags
#rendering #ui #auth #anti-patterns

---

## Template

```
## Lesson: [Short Title]
**Date:** YYYY-MM-DD
**Trigger:** What the user corrected / what went wrong

### What Went Wrong
Describe clearly what mistake was made.

### Root Cause
Why did it happen?

### Rule to Prevent It
Write a concrete rule: "Always do X" or "Never do Y because Z"

### Tags
#category (e.g. #database, #auth, #typescript, #nextjs)
```
