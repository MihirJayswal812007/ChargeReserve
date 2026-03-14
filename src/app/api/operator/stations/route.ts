import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET /api/operator/stations — list operator's own stations
export async function GET(_req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "OPERATOR" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stations = await prisma.station.findMany({
    where: user.role === "ADMIN" ? {} : { operatorId: user.userId },
    include: {
      chargers: {
        select: { id: true, type: true, powerKw: true, pricePerKwh: true, status: true },
      },
      _count: {
        select: {
          chargers: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get booking counts per station via charger ids
  const stationIds = stations.map((s) => s.id);
  const bookingSummary = await prisma.booking.groupBy({
    by: ["chargerId"],
    where: {
      charger: { stationId: { in: stationIds } },
      status: { in: ["CONFIRMED", "COMPLETED"] },
    },
    _count: { id: true },
  });

  // Map charger -> station
  const chargerToStation: Record<string, string> = {};
  for (const s of stations) {
    for (const c of s.chargers) {
      chargerToStation[c.id] = s.id;
    }
  }

  const bookingsByStation: Record<string, number> = {};
  for (const b of bookingSummary) {
    const sId = chargerToStation[b.chargerId];
    if (sId) {
      bookingsByStation[sId] = (bookingsByStation[sId] ?? 0) + (b._count?.id ?? 0);
    }
  }

  const result = stations.map((s) => ({
    ...s,
    totalBookings: bookingsByStation[s.id] ?? 0,
  }));

  return NextResponse.json({ stations: result });
}

// POST /api/operator/stations — create new station
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "OPERATOR" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    name, address, city, country, latitude, longitude,
    amenities, operatingHours, chargers,
  } = body;

  if (!name || !address || !city || !country || latitude == null || longitude == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const station = await prisma.$transaction(async (tx) => {
    const s = await tx.station.create({
      data: {
        name,
        address,
        city,
        country,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        amenities: amenities ?? [],
        operatingHours: operatingHours ?? "24/7",
        operatorId: user.userId,
        totalChargers: chargers?.length ?? 0,
        status: user.role === "ADMIN" ? "ACTIVE" : "PENDING_APPROVAL",
      },
    });

    if (chargers && chargers.length > 0) {
      await tx.charger.createMany({
        data: chargers.map((c: { type: import('@prisma/client').ChargerType; powerKw: string; pricePerKwh: string }) => ({
          stationId: s.id,
          type: c.type,
          powerKw: parseFloat(c.powerKw),
          pricePerKwh: parseFloat(c.pricePerKwh),
          status: "AVAILABLE",
        })),
      });
    }

    return s;
  });

  return NextResponse.json({ station }, { status: 201 });
}
