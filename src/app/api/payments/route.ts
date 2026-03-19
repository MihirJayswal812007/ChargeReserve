import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import Stripe from "stripe"
import { getCurrentUser } from "@/lib/auth"
import { JwtPayload } from "jsonwebtoken"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: "2026-02-25.clover", 
})

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
        charger: {
          include: {
            station: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized for this booking" }, { status: 403 })
    }

    const amount = booking.totalCost || 5.0 // fallback minimal amount
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Charging Session at ${booking.charger.station.name}`,
              description: `Charger type: ${booking.charger.type}, Energy used: ${booking.session?.energyUsed.toFixed(2)} kWh`,
            },
            unit_amount: Math.round(amount * 100), // convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/charging/${booking.id}/payment?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/charging/${booking.id}/payment?status=cancelled`,
    })

    // Create or Update payment record in DB
    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId: booking.id }
    })

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          transactionId: session.id, // Update to the new checkout session
          status: "PENDING",
        }
      })
    } else {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          userId: userId,
          amount: amount,
          paymentMethod: "stripe",
          transactionId: session.id,
        },
      })
    }

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error("Payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
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
