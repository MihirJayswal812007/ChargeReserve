import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// POST /api/sessions/start  — body: { bookingId }
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookingId } = await req.json();
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId required" }, { status: 400 });
  }

  // Verify booking ownership + status
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { charger: true, session: true },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (booking.status === "CANCELLED") return NextResponse.json({ error: "Booking is cancelled" }, { status: 400 });
  if (booking.status === "COMPLETED") return NextResponse.json({ error: "Booking already completed" }, { status: 400 });

  // If session already exists, return it
  if (booking.session) {
    return NextResponse.json({ session: booking.session });
  }

  // Start session + mark charger IN_USE atomically
  const session = await prisma.$transaction(async (tx) => {
    const s = await tx.chargingSession.create({
      data: {
        bookingId,
        energyUsed: 0,
        cost: 0,
        duration: 0,
        status: "ACTIVE",
      },
    });

    await tx.charger.update({
      where: { id: booking.chargerId },
      data: { status: "IN_USE" },
    });

    return s;
  });

  return NextResponse.json({ session }, { status: 201 });
}
