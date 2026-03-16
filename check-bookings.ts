import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const bookings = await prisma.booking.findMany()
  console.log("Bookings count:", bookings.length)
  console.dir(bookings, { depth: null })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
