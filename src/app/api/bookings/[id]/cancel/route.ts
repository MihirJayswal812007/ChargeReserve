import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// PUT /api/bookings/[id]/cancel — cancel a booking and free the charger
export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { session: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only the booking owner (or admin) can cancel
    if (booking.userId !== user.userId && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    if (booking.status === "COMPLETED") {
      return NextResponse.json({ error: "Cannot cancel a completed booking" }, { status: 400 });
    }

    if (booking.session?.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Cannot cancel while a charging session is active" },
        { status: 400 }
      );
    }

    // Cancel and free the charger in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      // Free the charger only if it was BOOKED (not IN_USE/MAINTENANCE)
      await tx.charger.updateMany({
        where: { id: booking.chargerId, status: "BOOKED" },
        data: { status: "AVAILABLE" },
      });

      return b;
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (err) {
    console.error("[PUT /api/bookings/[id]/cancel]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
