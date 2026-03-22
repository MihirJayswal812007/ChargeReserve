import LandingPageClient from "@/components/landing-page-client";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  let stations: any[] = [];
  let errorText = "";
  try {
    stations = await prisma.station.findMany({
      where: { status: "ACTIVE" },
      include: {
        chargers: {
          select: { status: true, powerKw: true, pricePerKwh: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch (err: any) {
    errorText = err.message || String(err);
    console.error("Prisma error in explore page:", err);
  }

  if (errorText) {
    return <div className="p-8 text-red-500 whitespace-pre-wrap font-mono">{errorText}</div>;
  }


  const stationsForUI = stations.map((s: any) => {
    const available = s.chargers.filter((c: any) => c.status === "AVAILABLE").length;
    const maxPower = Math.max(...s.chargers.map((c: any) => c.powerKw), 0);
    const minPrice = s.chargers.length
      ? Math.min(...s.chargers.map((c: any) => c.pricePerKwh))
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
