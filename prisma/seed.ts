import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role, StationStatus, ChargerType, ChargerStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding ChargeReserve database...");

  // ── Clean slate ──────────────────────────────────────
  await prisma.payment.deleteMany();
  await prisma.chargingSession.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.charger.deleteMany();
  await prisma.station.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Alex Admin",
      email: "admin@chargereserve.com",
      password: passwordHash,
      role: Role.ADMIN,
      phone: "+1-555-0001",
    },
  });

  const operator1 = await prisma.user.create({
    data: {
      name: "Oliver Charge",
      email: "operator1@chargereserve.com",
      password: passwordHash,
      role: Role.OPERATOR,
      phone: "+1-555-0100",
    },
  });

  const operator2 = await prisma.user.create({
    data: {
      name: "Priya Volt",
      email: "operator2@chargereserve.com",
      password: passwordHash,
      role: Role.OPERATOR,
      phone: "+65-555-0200",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: "Sam Driver",
      email: "user@chargereserve.com",
      password: passwordHash,
      role: Role.USER,
      phone: "+1-555-0300",
      vehicleType: "Tesla Model 3",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Jamie EV",
      email: "user2@chargereserve.com",
      password: passwordHash,
      role: Role.USER,
      vehicleType: "Hyundai IONIQ 5",
    },
  });

  console.log("✅ Users seeded");

  // ── Stations ─────────────────────────────────────────
  const station1 = await prisma.station.create({
    data: {
      name: "Connaught Place EV Hub",
      address: "Inner Circle, Connaught Place",
      city: "New Delhi",
      country: "India",
      latitude: 28.6304,
      longitude: 77.2177,
      operatorId: operator1.id,
      rating: 4.7,
      amenities: ["WiFi", "Restrooms", "Cafe", "Parking"],
      operatingHours: "24/7",
      status: StationStatus.ACTIVE,
      totalChargers: 4,
    },
  });

  const station2 = await prisma.station.create({
    data: {
      name: "Bandra Kurla Complex Charge Point",
      address: "Bandra Kurla Complex",
      city: "Mumbai",
      country: "India",
      latitude: 19.0596,
      longitude: 72.8647,
      operatorId: operator1.id,
      rating: 4.5,
      amenities: ["WiFi", "Shopping Mall", "Parking"],
      operatingHours: "06:00 - 23:00",
      status: StationStatus.ACTIVE,
      totalChargers: 3,
    },
  });

  const station3 = await prisma.station.create({
    data: {
      name: "Koramangala Supercharger",
      address: "80 Feet Road, Koramangala",
      city: "Bangalore",
      country: "India",
      latitude: 12.9345,
      longitude: 77.6212,
      operatorId: operator2.id,
      rating: 4.8,
      amenities: ["WiFi", "Shopping", "Restrooms", "Lounge"],
      operatingHours: "24/7",
      status: StationStatus.ACTIVE,
      totalChargers: 5,
    },
  });

  const station4 = await prisma.station.create({
    data: {
      name: "Hyderabad Tech Park Charge Hub",
      address: "HITEC City",
      city: "Hyderabad",
      country: "India",
      latitude: 17.4435,
      longitude: 78.3772,
      operatorId: operator2.id,
      rating: 4.9,
      amenities: ["WiFi", "Restaurants", "Shops", "Lounge", "Parking"],
      operatingHours: "24/7",
      status: StationStatus.ACTIVE,
      totalChargers: 6,
    },
  });

  const station5 = await prisma.station.create({
    data: {
      name: "Aundh EV Station",
      address: "Aundh, Pune",
      city: "Pune",
      country: "India",
      latitude: 18.5583,
      longitude: 73.8075,
      operatorId: operator1.id,
      rating: 4.3,
      amenities: ["Parking", "Restrooms"],
      operatingHours: "07:00 - 22:00",
      status: StationStatus.PENDING_APPROVAL,
      totalChargers: 3,
    },
  });

  console.log("✅ Stations seeded");

  // ── Chargers ─────────────────────────────────────────
  await prisma.charger.createMany({
    data: [
      // Station 1 — Downtown EV Hub
      { stationId: station1.id, type: ChargerType.CCS,     powerKw: 150, pricePerKwh: 0.35, status: ChargerStatus.AVAILABLE },
      { stationId: station1.id, type: ChargerType.CCS,     powerKw: 150, pricePerKwh: 0.35, status: ChargerStatus.AVAILABLE },
      { stationId: station1.id, type: ChargerType.TYPE2,   powerKw: 22,  pricePerKwh: 0.25, status: ChargerStatus.AVAILABLE },
      { stationId: station1.id, type: ChargerType.CHADEMO, powerKw: 50,  pricePerKwh: 0.30, status: ChargerStatus.MAINTENANCE },
      // Station 2 — Marina Bay
      { stationId: station2.id, type: ChargerType.CCS,   powerKw: 100, pricePerKwh: 0.38, status: ChargerStatus.AVAILABLE },
      { stationId: station2.id, type: ChargerType.TYPE2, powerKw: 22,  pricePerKwh: 0.25, status: ChargerStatus.AVAILABLE },
      { stationId: station2.id, type: ChargerType.J1772, powerKw: 7,   pricePerKwh: 0.20, status: ChargerStatus.AVAILABLE },
      // Station 3 — Orchard
      { stationId: station3.id, type: ChargerType.CCS,     powerKw: 350, pricePerKwh: 0.42, status: ChargerStatus.AVAILABLE },
      { stationId: station3.id, type: ChargerType.CCS,     powerKw: 350, pricePerKwh: 0.42, status: ChargerStatus.IN_USE },
      { stationId: station3.id, type: ChargerType.TYPE2,   powerKw: 22,  pricePerKwh: 0.25, status: ChargerStatus.AVAILABLE },
      { stationId: station3.id, type: ChargerType.CHADEMO, powerKw: 50,  pricePerKwh: 0.30, status: ChargerStatus.AVAILABLE },
      { stationId: station3.id, type: ChargerType.J1772,   powerKw: 7,   pricePerKwh: 0.18, status: ChargerStatus.AVAILABLE },
      // Station 4 — Changi Airport
      { stationId: station4.id, type: ChargerType.CCS,     powerKw: 350, pricePerKwh: 0.45, status: ChargerStatus.AVAILABLE },
      { stationId: station4.id, type: ChargerType.CCS,     powerKw: 350, pricePerKwh: 0.45, status: ChargerStatus.AVAILABLE },
      { stationId: station4.id, type: ChargerType.CCS,     powerKw: 150, pricePerKwh: 0.38, status: ChargerStatus.AVAILABLE },
      { stationId: station4.id, type: ChargerType.TYPE2,   powerKw: 22,  pricePerKwh: 0.25, status: ChargerStatus.BOOKED },
      { stationId: station4.id, type: ChargerType.CHADEMO, powerKw: 50,  pricePerKwh: 0.30, status: ChargerStatus.AVAILABLE },
      { stationId: station4.id, type: ChargerType.J1772,   powerKw: 11,  pricePerKwh: 0.22, status: ChargerStatus.AVAILABLE },
      // Station 5 — Jurong West
      { stationId: station5.id, type: ChargerType.CCS,   powerKw: 50, pricePerKwh: 0.28, status: ChargerStatus.AVAILABLE },
      { stationId: station5.id, type: ChargerType.TYPE2, powerKw: 22, pricePerKwh: 0.22, status: ChargerStatus.AVAILABLE },
      { stationId: station5.id, type: ChargerType.J1772, powerKw: 7,  pricePerKwh: 0.18, status: ChargerStatus.AVAILABLE },
    ],
  });

  console.log("✅ Chargers seeded");
  console.log("");
  console.log("🎉 Seed complete! Test accounts:");
  console.log("   Admin    → admin@chargereserve.com    / password123");
  console.log("   Operator → operator1@chargereserve.com / password123");
  console.log("   Operator → operator2@chargereserve.com / password123");
  console.log("   User     → user@chargereserve.com     / password123");
  console.log("   User     → user2@chargereserve.com    / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
