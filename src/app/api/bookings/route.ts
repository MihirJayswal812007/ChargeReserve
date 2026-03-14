import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// POST /api/bookings — create a booking with double-booking prevention
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    chargerId: string;
    startTime: string;
    endTime: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { chargerId, startTime, endTime } = body;
  if (!chargerId || !startTime || !endTime) {
    return NextResponse.json(
      { error: "chargerId, startTime, and endTime are required" },
      { status: 400 }
    );
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
    return NextResponse.json(
      { error: "Invalid time range" },
      { status: 400 }
    );
  }

  try {
    // Check charger exists and is AVAILABLE
    const charger = await prisma.charger.findUnique({
      where: { id: chargerId },
      include: { station: { select: { status: true, name: true } } },
    });

    if (!charger) {
      return NextResponse.json({ error: "Charger not found" }, { status: 404 });
    }
    if (charger.station.status !== "ACTIVE") {
      return NextResponse.json({ error: "Station is not active" }, { status: 400 });
    }
    if (charger.status === "MAINTENANCE") {
      return NextResponse.json(
        { error: "Charger is under maintenance" },
        { status: 400 }
      );
    }

    // Check for overlapping bookings (double-booking prevention)
    const overlap = await prisma.booking.findFirst({
      where: {
        chargerId,
        status: { in: ["PENDING", "CONFIRMED"] },
        AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
      },
    });

    if (overlap) {
      return NextResponse.json(
        { error: "This charger is already booked for the selected time slot" },
        { status: 409 }
      );
    }

    // Generate a 4-digit PIN
    const pin = String(Math.floor(1000 + Math.random() * 9000));

    // Estimate total cost
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    // Assume avg 80% efficiency: kWh ≈ powerKw * hours * 0.8 — capped for display
    const estimatedKwh = charger.powerKw * durationHours * 0.8;
    const totalCost = parseFloat((estimatedKwh * charger.pricePerKwh).toFixed(2));

    // Create booking in a transaction — also mark charger BOOKED
    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          userId: user.userId,
          chargerId,
          startTime: start,
          endTime: end,
          pin,
          totalCost,
          status: "CONFIRMED",
        },
        include: {
          charger: {
            include: { station: { select: { name: true, address: true, city: true } } },
          },
        },
      });

      await tx.charger.update({
        where: { id: chargerId },
        data: { status: "BOOKED" },
      });

      return b;
    });

    return NextResponse.json(
      {
        id: booking.id,
        qrCode: booking.qrCode,
        pin: booking.pin,
        status: booking.status,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalCost: booking.totalCost,
        charger: {
          id: booking.charger.id,
          type: booking.charger.type,
          powerKw: booking.charger.powerKw,
          pricePerKwh: booking.charger.pricePerKwh,
          station: booking.charger.station,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/bookings]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/bookings — list authenticated user's bookings
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status"); // optional filter
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.userId,
        ...(status ? { status: status as import('@prisma/client').BookingStatus } : {}),
      },
      include: {
        charger: {
          include: {
            station: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
              },
            },
          },
        },
        session: {
          select: {
            id: true,
            energyUsed: true,
            cost: true,
            duration: true,
            status: true,
            startTime: true,
            endTime: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({ bookings, page, limit });
  } catch (err) {
    console.error("[GET /api/bookings]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
