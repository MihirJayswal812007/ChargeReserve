"use client"

import { use, useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function PaymentResultContent({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = searchParams.get("status")

  if (status === "success") {
    return (
      <div className="max-w-md mx-auto p-6 space-y-8 mt-12 text-center">
        <div className="mx-auto w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Successful!</h1>
        <p className="text-muted-foreground">
          Thank you for using ChargeReserve. Your payment for booking {bookingId} has been securely processed.
        </p>
        <div className="pt-8">
          <Link href="/dashboard" className="w-full inline-flex items-center justify-center bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (status === "cancelled") {
    return (
      <div className="max-w-md mx-auto p-6 space-y-8 mt-12 text-center">
        <div className="mx-auto w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Cancelled</h1>
        <p className="text-muted-foreground">
          Your payment was cancelled or interrupted. No charges were made.
        </p>
        <div className="pt-8 space-y-3">
          <button 
            onClick={() => router.push(`/charging/${bookingId}`)}
            className="w-full inline-flex items-center justify-center bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          <Link href="/dashboard" className="w-full inline-flex items-center justify-center bg-muted text-foreground py-3 rounded-md font-medium hover:bg-muted/80 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

export default function PaymentResultPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const resolvedParams = use(params)
  const bookingId = resolvedParams.bookingId

  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <PaymentResultContent bookingId={bookingId} />
    </Suspense>
  )
}
