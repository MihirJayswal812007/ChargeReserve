import LandingPageClient from "@/components/landing-page-client";
import { prisma } from "@/lib/db";

export default async function LandingPage() {
  // Fetch latest 6 active stations with availability summary
  const stations = await prisma.station.findMany({
    where: { status: "ACTIVE" },
    include: {
      chargers: {
        select: { status: true, powerKw: true, pricePerKwh: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const stationsForUI = stations.map((s) => {
    const available = s.chargers.filter((c) => c.status === "AVAILABLE").length;
    const maxPower = Math.max(...s.chargers.map((c) => c.powerKw), 0);
    const minPrice = s.chargers.length
      ? Math.min(...s.chargers.map((c) => c.pricePerKwh))
      : null;
    return {
      id: s.id,
      name: s.name,
      address: s.address,
      city: s.city,
      available,
      total: s.totalChargers,
      speed: `${maxPower} kW`,
      price: minPrice !== null ? `₹${minPrice.toFixed(2)}/kWh` : "—",
      operatingHours: s.operatingHours,
    };
  });

  return <LandingPageClient stations={stationsForUI} />;
}
