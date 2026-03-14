"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { ProgressRing } from "@/components/charging/progress-ring"

type ChargingSession = {
  id?: string
  status?: string
  energyUsed?: number
  cost?: number
  duration?: number
  booking?: {
    id: string
    status: string
    charger: {
      powerKw: number
      pricePerKwh: number
      station: {
        name: string
      }
    }
  }
}

export default function ChargingPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const bookingId = resolvedParams.bookingId

  const [session, setSession] = useState<ChargingSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/charging/${bookingId}/status`)
      if (res.ok) {
        const data = await res.json()
        setSession(data)
      } else {
        // if 404, it might mean the session hasn't started yet.
        const data = await res.json()
        if (data.error === "Session not found") {
          setSession({ status: "NOT_STARTED" })
        } else {
          setError(data.error || "Failed to fetch status")
        }
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    
    // Poll every 5 seconds if session is active
    const interval = setInterval(() => {
      if (session && session.status !== "COMPLETED" && session.status !== "NOT_STARTED") {
        fetchStatus()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [bookingId, session?.status])

  const startCharging = async () => {
    setActionLoading(true)
    setError("")
    try {
      const res = await fetch("/api/charging/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })
      if (res.ok) {
        fetchStatus()
      } else {
        const data = await res.json()
        setError(data.error || "Failed to start charging")
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  const stopCharging = async () => {
    setActionLoading(true)
    setError("")
    try {
      const res = await fetch("/api/charging/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })
      if (res.ok) {
        fetchStatus()
      } else {
        const data = await res.json()
        setError(data.error || "Failed to stop charging")
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  const handlePayment = async () => {
    setActionLoading(true)
    setError("")
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || "Failed to initiate payment")
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Charging Session</h1>
        <p className="text-muted-foreground text-sm">Booking ID: {bookingId}</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-100/10 border border-red-500/20 rounded-md">
          {error}
        </div>
      )}

      {session?.status === "NOT_STARTED" && (
        <div className="bg-card border rounded-xl p-8 text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-muted-foreground">Ready to begin charging.</p>
          <button
            onClick={startCharging}
            disabled={actionLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {actionLoading ? "Starting..." : "Start Charging"}
          </button>
        </div>
      )}

      {(session?.status === "ACTIVE" || session?.status === "IN_PROGRESS" || session?.id && session?.status !== "COMPLETED") && (
        <div className="bg-card border rounded-xl p-8 space-y-8 shadow-sm">
          <div className="flex justify-center">
            <div className="relative flex items-center justify-center">
              <ProgressRing progress={((session.duration || 0) % 60) / 60 * 100} />
              <div className="absolute text-center">
                <div className="text-3xl font-bold">{session.duration || 0}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Mins</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <div className="text-xs text-muted-foreground uppercase mb-1">Energy Delivered</div>
              <div className="font-semibold text-lg">{session.energyUsed?.toFixed(2) || "0.00"} kWh</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <div className="text-xs text-muted-foreground uppercase mb-1">Current Cost</div>
              <div className="font-semibold text-lg">₹{session.cost?.toFixed(2) || "0.00"}</div>
            </div>
          </div>

          <button
            onClick={stopCharging}
            disabled={actionLoading}
            className="w-full bg-red-500 text-white py-3 rounded-md font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {actionLoading ? "Stopping..." : "Stop Charging"}
          </button>
        </div>
      )}

      {session?.status === "COMPLETED" && (
        <div className="bg-card border rounded-xl p-8 space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div className="text-center space-y-1">
            <h2 className="text-xl font-semibold">Session Complete</h2>
            <p className="text-muted-foreground">Please review and pay your receipt.</p>
          </div>

          <div className="space-y-3 bg-muted/30 p-5 rounded-lg border text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{session.duration} mins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Energy used</span>
              <span className="font-medium">{session.energyUsed?.toFixed(2)} kWh</span>
            </div>
            <div className="border-t pt-3 mt-3 flex justify-between font-medium">
              <span>Total Amount</span>
              <span className="text-lg">₹{session.cost?.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={actionLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {actionLoading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      )}
    </div>
  )
}
