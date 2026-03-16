import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, StationStatus, ChargerType, ChargerStatus } from "@prisma/client";
import { parse } from "csv-parse/sync";
import fs from "fs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding CSV stations...");

  const csvFile = fs.readFileSync("prisma/data/ev-charging-stations-india.csv", "utf-8");
  const records = parse(csvFile, { columns: true, skip_empty_lines: true }) as any[];

  const adminUser = await prisma.user.findFirst({ where: { email: "operator1@chargereserve.com" } });
  if (!adminUser) {
    console.error("No operator found to own the stations. Run seed.ts first.");
    return;
  }

  // Delete existing CSV-seeded stations (they have no special marker, so delete all
  // stations that belong to operator1 except the 5 hand-crafted ones from seed.ts)
  const HAND_CRAFTED = [
    "Connaught Place EV Hub",
    "Bandra Kurla Complex Charge Point",
    "Koramangala Supercharger",
    "Hyderabad Tech Park Charge Hub",
    "Aundh EV Station",
  ];
  await prisma.station.deleteMany({
    where: {
      operatorId: adminUser.id,
      name: { notIn: HAND_CRAFTED },
    },
  });

  console.log(`📦 Building batch of ${records.length} stations...`);

  // Build station data array
  const stationData = records.map((row: any) => {
    let lat = parseFloat(row.lattitude);
    let lng = parseFloat(row.longitude);
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      lat = 20.59 + (Math.random() - 0.5) * 10;
      lng = 78.96 + (Math.random() - 0.5) * 10;
    }
    return {
      name: (row.name || "Unknown Station").trim(),
      city: (row.city || "Unknown City").trim(),
      address: (row.address || row.state || "India").trim(),
      country: "India",
      latitude: lat,
      longitude: lng,
      operatorId: adminUser.id,
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      amenities: ["Parking", "WiFi"],
      operatingHours: "24/7",
      status: StationStatus.ACTIVE,
      totalChargers: 2,
    };
  });

  // Insert stations in batches of 200
  const BATCH = 200;
  let totalInserted = 0;
  for (let i = 0; i < stationData.length; i += BATCH) {
    const chunk = stationData.slice(i, i + BATCH);
    await prisma.station.createMany({ data: chunk, skipDuplicates: true });
    totalInserted += chunk.length;
    console.log(`  ✅ Inserted ${totalInserted}/${stationData.length} stations`);
  }

  // Now bulk-insert chargers: fetch all station IDs that were just created
  const insertedStations = await prisma.station.findMany({
    where: { operatorId: adminUser.id, name: { notIn: HAND_CRAFTED } },
    select: { id: true },
  });

  const chargerData = insertedStations.flatMap((s) => [
    { stationId: s.id, type: ChargerType.CCS, powerKw: 50, pricePerKwh: 0.25, status: ChargerStatus.AVAILABLE },
    { stationId: s.id, type: ChargerType.TYPE2, powerKw: 22, pricePerKwh: 0.15, status: ChargerStatus.AVAILABLE },
  ]);

  console.log(`⚡ Inserting ${chargerData.length} chargers...`);
  for (let i = 0; i < chargerData.length; i += BATCH * 2) {
    await prisma.charger.createMany({ data: chargerData.slice(i, i + BATCH * 2), skipDuplicates: true });
  }

  console.log(`\n✅ Done! ${insertedStations.length} CSV Stations seeded with ${chargerData.length} chargers.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
