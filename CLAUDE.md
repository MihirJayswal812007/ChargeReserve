# ChargeReserve — Project CLAUDE.md

> **Session Start Ritual:**
> 1. Read `tasks/lessons.md` — internalize all rules before touching code
> 2. Read `tasks/todo.md` — understand current state and pending work
> 3. Follow global workflow in `~/CLAUDE.md` throughout the session

---

## Project Overview

**ChargeReserve** is an EV charging slot reservation platform built with:

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Database | PostgreSQL via Neon DB |
| ORM | Prisma |
| Auth | NextAuth.js |
| Deployment | Vercel (planned) |

---

## Project Structure

```
ChargeReserve/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth routes (login, register)
│   │   ├── dashboard/          # User dashboard
│   │   ├── operator/           # Operator panel
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # shadcn/ui + custom UI components
│   │   └── ...                 # Feature components
│   └── lib/
│       ├── auth.ts             # NextAuth config
│       ├── prisma.ts           # Prisma client singleton
│       └── ...
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed-csv.ts             # Seed script
├── tasks/
│   ├── todo.md                 ← ACTIVE TASK PLAN (update every session)
│   └── lessons.md              ← LESSONS LOG (review every session)
└── CLAUDE.md                   ← This file
```

---

## Key Roles

- **EV Driver (User)**: Browses stations, books slots, manages reservations
- **Operator**: Manages charging stations, views bookings, handles availability
- **Admin**: Platform-level administration

---

## Coding Standards for This Project

### TypeScript
- Strict mode enabled — no `any` types without justification
- Use Zod for all runtime validation (API input, form data)
- Prefer explicit return types on server actions and API handlers

### Database / Prisma
- Always use the singleton Prisma client from `src/lib/prisma.ts`
- Run `npx prisma generate` after schema changes
- Never use raw SQL unless absolutely necessary

### Next.js App Router
- Prefer **Server Components** by default
- Use `"use client"` only when interactivity is required
- Server Actions for form submissions and mutations
- API routes only for external integrations or webhooks

### Auth
- All protected routes must check session via `auth()` from `src/lib/auth.ts`
- Never expose sensitive data to client components without proper guards

### Styling
- Use Tailwind utility classes
- Follow the dark/light theme system set up via `theme-provider.tsx`
- Never write inline styles unless generating dynamic values

---

## Common Commands

```bash
# Development
npm run dev

# Database
npx prisma studio          # GUI for database
npx prisma migrate dev      # Create + apply migration
npx prisma generate         # Regenerate Prisma client
npx prisma db seed          # Run seed script

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

---

## Anti-Patterns — Never Do These

- ❌ Do not use `useEffect` for data fetching — use Server Components or React Query
- ❌ Do not commit `.env` or `.env.local` files
- ❌ Do not bypass TypeScript errors with `@ts-ignore` without a comment explaining why
- ❌ Do not write new DB queries outside of server-side code (Server Components, Server Actions, API routes)
- ❌ Do not mark a task done before verifying it works end-to-end

---

## Task Files

| File | Purpose |
|------|---------|
| `tasks/todo.md` | Current sprint / feature plan with checkable steps |
| `tasks/lessons.md` | Lessons from mistakes — **read before every session** |
