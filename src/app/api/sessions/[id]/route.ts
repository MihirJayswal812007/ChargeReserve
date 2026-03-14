import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET /api/sessions/[id]  — poll session state
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const session = await prisma.chargingSession.findUnique({
    where: { id },
    include: {
      booking: {
        select: {
          userId: true,
          charger: { select: { powerKw: true, pricePerKwh: true, type: true } },
        },
      },
    },
  });

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.booking.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ session });
}

// PUT /api/sessions/[id]  — stop session (body can be empty)
export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const session = await prisma.chargingSession.findUnique({
    where: { id },
    include: {
      booking: {
        select: {
          userId: true,
          chargerId: true,
          charger: { select: { pricePerKwh: true, powerKw: true } },
        },
      },
    },
  });

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.booking.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (session.status === "COMPLETED") return NextResponse.json({ session });

  const now = new Date();
  const startedAt = session.startTime;
  const durationSeconds = Math.round((now.getTime() - startedAt.getTime()) / 1000);

  // Realistic charging: power (kW) × hours × efficiency factor
  const hoursCharged = durationSeconds / 3600;
  const energyUsed = +(session.booking.charger.powerKw * hoursCharged * 0.85).toFixed(2);
  const cost = +(energyUsed * session.booking.charger.pricePerKwh).toFixed(2);

  const updated = await prisma.$transaction(async (tx) => {
    const s = await tx.chargingSession.update({
      where: { id },
      data: {
        status: "COMPLETED",
        endTime: now,
        duration: durationSeconds,
        energyUsed,
        cost,
      },
    });

    // Mark booking COMPLETED and store total cost
    await tx.booking.update({
      where: { id: session.bookingId },
      data: { status: "COMPLETED", totalCost: cost },
    });

    // Free up charger
    await tx.charger.update({
      where: { id: session.booking.chargerId },
      data: { status: "AVAILABLE" },
    });

    return s;
  });

  return NextResponse.json({ session: updated });
}

// PATCH /api/sessions/[id]  — update live metrics (called periodically during session)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { energyUsed, duration } = await req.json();

  const session = await prisma.chargingSession.findUnique({
    where: { id },
    include: {
      booking: {
        select: {
          userId: true,
          charger: { select: { pricePerKwh: true } },
        },
      },
    },
  });

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.booking.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (session.status === "COMPLETED") return NextResponse.json({ session });

  const cost = +(energyUsed * session.booking.charger.pricePerKwh).toFixed(2);

  const updated = await prisma.chargingSession.update({
    where: { id },
    data: { energyUsed, duration, cost },
  });

  return NextResponse.json({ session: updated });
}
