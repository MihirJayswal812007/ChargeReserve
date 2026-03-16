// webhook route
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: "2023-10-16" as any,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = (await headers()).get("stripe-signature")

    let event: Stripe.Event

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Webhook signature verification failed: ${errorMessage}`)
        return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 })
      }
    } else {
      // In dev environment without webhook secret, just accept it and parse the body directly
      event = JSON.parse(rawBody) as Stripe.Event
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Update payment status
      await prisma.payment.updateMany({
        where: { transactionId: session.id },
        data: { status: "COMPLETED" },
      })
      
      const payment = await prisma.payment.findFirst({
        where: { transactionId: session.id }
      })

      if (payment) {
        // Also update the booking? No, booking status has 'paymentStatus' if we had it.
        // But we DO have a payment model.
        // Also we can set Booking status to COMPLETED if not already
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: "COMPLETED" }
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
