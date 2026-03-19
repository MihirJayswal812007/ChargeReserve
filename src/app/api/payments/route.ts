import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { JwtPayload } from "jsonwebtoken"

// ── Demo Payment API ─────────────────────────────────────────────────────────
// Stripe is invite-only in India. This demo endpoint simulates an instant
// payment flow: charge is immediately marked COMPLETED, no external gateway.

export async function POST(req: Request) {
  try {
    const authResult = await getCurrentUser()
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = authResult as JwtPayload
    const { bookingId } = await req.json()

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        session: true,
        charger: { include: { station: true } },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized for this booking" }, { status: 403 })
    }

    const amount = booking.session?.cost ?? booking.totalCost ?? 5.0
    const demoTransactionId = `DEMO_${Date.now()}_${bookingId.slice(0, 8).toUpperCase()}`

    // Upsert payment record and mark as COMPLETED instantly
    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId: booking.id },
    })

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          transactionId: demoTransactionId,
          status: "COMPLETED",
          amount,
        },
      })
    } else {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          userId,
          amount,
          paymentMethod: "demo",
          transactionId: demoTransactionId,
          status: "COMPLETED",
        },
      })
    }

    // Mark booking as COMPLETED
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "COMPLETED" },
    })

    return NextResponse.json({
      success: true,
      transactionId: demoTransactionId,
      amount,
    })
  } catch (error: unknown) {
    console.error("Demo payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const authResult = await getCurrentUser()
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = authResult as JwtPayload

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Fetch payments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
