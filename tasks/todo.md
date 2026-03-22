# TODO

- [x] Fix database connection issue after system shutdown (no patch work)
- [x] Add explicit `DATABASE_URL` configuration to Prisma and Next.js instantiation

## Review
- Successfully updated `prisma/schema.prisma` to include the `url` implicitly enforcing Prisma CLI to expect `DATABASE_URL`.
- Enforced `dotenv/config` and explicit `process.env.DATABASE_URL` retrieval in `src/lib/db.ts` to resolve the root cause of the Prisma/Neon connection string bug on Next.js Turbopack initialization after laptop shutdowns.
