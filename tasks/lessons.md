# Lessons Learned

- Database Connection Issue: Next.js or Prisma may encounter an issue where the environment `DATABASE_URL` isn't accessible at runtime if not configured correctly. Prisma schema requires the `url` specified in the datasource block (`url = env("DATABASE_URL")`). Furthermore, custom instantiation of `PrismaClient` with `@neondatabase/serverless` using `Pool` requires explicit fallback mechanisms if Next.js does not populate `process.env.DATABASE_URL` accurately in the initialized context.
