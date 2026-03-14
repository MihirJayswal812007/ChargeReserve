import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/stations/[id] — full station detail with charger availability
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const station = await prisma.station.findUnique({
      where: { id },
      include: {
        operator: { select: { id: true, name: true, email: true } },
        chargers: {
          orderBy: [{ status: "asc" }, { powerKw: "desc" }],
          select: {
            id: true,
            type: true,
            powerKw: true,
            pricePerKwh: true,
            status: true,
          },
        },
      },
    });

    if (!station || station.status !== "ACTIVE") {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const availableCount = station.chargers.filter(
      (c) => c.status === "AVAILABLE"
    ).length;

    return NextResponse.json({
      ...station,
      availableChargers: availableCount,
    });
  } catch (err) {
    console.error("[GET /api/stations/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
