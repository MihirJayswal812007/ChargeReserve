// Stripe webhook route — DISABLED
// Stripe is invite-only in India. The demo payment flow completes payments
// directly via POST /api/payments without any webhook. This file is kept
// as a placeholder so no 404 is thrown if an old reference is hit.

import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json({ message: "Stripe webhooks are disabled. Using demo payment flow." }, { status: 200 })
}
