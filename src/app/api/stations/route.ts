import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/stations?city=&type=&minPower=&page=&limit=
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const city = searchParams.get("city") ?? undefined;
  const type = searchParams.get("type") ?? undefined; // ChargerType enum
  const minPower = searchParams.get("minPower");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

  try {
    const stations = await prisma.station.findMany({
      where: {
        status: "ACTIVE",
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
        ...(type || minPower
          ? {
              chargers: {
                some: {
                  ...(type ? { type: type as any } : {}),
                  ...(minPower ? { powerKw: { gte: parseFloat(minPower) } } : {}),
                },
              },
            }
          : {}),
      },
      include: {
        chargers: {
          select: {
            id: true,
            type: true,
            powerKw: true,
            pricePerKwh: true,
            status: true,
          },
        },
        operator: { select: { id: true, name: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Compute per-station availability summary
    const result = stations.map((s) => {
      const available = s.chargers.filter((c) => c.status === "AVAILABLE").length;
      const maxPower = s.chargers.reduce((m, c) => Math.max(m, c.powerKw), 0);
      const minPrice = s.chargers.reduce(
        (m, c) => Math.min(m, c.pricePerKwh),
        Infinity
      );
      return {
        id: s.id,
        name: s.name,
        address: s.address,
        city: s.city,
        country: s.country,
        latitude: s.latitude,
        longitude: s.longitude,
        rating: s.rating,
        amenities: s.amenities,
        operatingHours: s.operatingHours,
        status: s.status,
        operator: s.operator,
        totalChargers: s.totalChargers,
        availableChargers: available,
        maxPowerKw: maxPower,
        minPricePerKwh: minPrice === Infinity ? null : minPrice,
        chargerTypes: [...new Set(s.chargers.map((c) => c.type))],
      };
    });

    return NextResponse.json({ stations: result, page, limit });
  } catch (err) {
    console.error("[GET /api/stations]", err);
    return NextResponse.json({ error: "Failed to fetch stations" }, { status: 500 });
  }
}
