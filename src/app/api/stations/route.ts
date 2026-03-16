import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const city = searchParams.get("city") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const minPower = searchParams.get("minPower");
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const radiusStr = searchParams.get("radius") || "50";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(500, parseInt(searchParams.get("limit") ?? "50"));

  const userLat = latStr ? parseFloat(latStr) : null;
  const userLng = lngStr ? parseFloat(lngStr) : null;
  const radiusKm = parseFloat(radiusStr);

  try {
    const stations = await prisma.station.findMany({
      where: {
        status: "ACTIVE",
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
        ...(type || minPower
          ? {
              chargers: {
                some: {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    });

    let result = stations.map((s) => {
      const available = s.chargers.filter((c) => c.status === "AVAILABLE").length;
      const maxPower = s.chargers.reduce((m, c) => Math.max(m, c.powerKw), 0);
      const minPrice = s.chargers.reduce(
        (m, c) => Math.min(m, c.pricePerKwh),
        Infinity
      );
      
      let distance = null;
      if (userLat !== null && userLng !== null) {
        distance = getDistanceInKm(userLat, userLng, s.latitude, s.longitude);
      }

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
        availableCount: available,
        chargers: s.chargers,
        maxPowerKw: maxPower,
        minPricePerKwh: minPrice === Infinity ? null : minPrice,
        chargerTypes: [...new Set(s.chargers.map((c) => c.type))],
        distance,
      };
    });

    // Handle distance filtering and sorting
    if (userLat !== null && userLng !== null) {
      result = result.filter((s) => s.distance !== null && s.distance <= radiusKm);
      result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else {
      // Provide default stable sort if no location is given
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Apply pagination post-filtering
    const paginatedResult = result.slice((page - 1) * limit, page * limit);

    return NextResponse.json({ stations: paginatedResult, page, limit, total: result.length });
  } catch (err) {
    console.error("[GET /api/stations]", err);
    return NextResponse.json({ error: "Failed to fetch stations" }, { status: 500 });
  }
}
