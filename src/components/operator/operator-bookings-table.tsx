"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export function OperatorBookingsTable({ bookings }: { bookings: any[] }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [filterSearch, setFilterSearch] = useState("")

  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus !== "ALL" && booking.status !== filterStatus) return false
    
    if (filterSearch) {
      const search = filterSearch.toLowerCase()
      const matchStation = booking.station.name.toLowerCase().includes(search)
      const matchCharger = booking.charger.id.toLowerCase().includes(search)
      const matchUser = booking.user?.name?.toLowerCase().includes(search) || booking.user?.email?.toLowerCase().includes(search)
      
      if (!matchStation && !matchCharger && !matchUser) return false
    }
    
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Input 
          placeholder="Search station, charger or user..." 
          value={filterSearch} 
          onChange={(e) => setFilterSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground whitespace-nowrap">
            <tr>
              <th className="px-4 py-3 font-medium">Station</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Date & Time</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y relative">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No bookings found matching filters.
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/30 transition-colors whitespace-nowrap">
                  <td className="px-4 py-3">
                    <div className="font-medium">{booking.station.name}</div>
                    <div className="text-xs text-muted-foreground">Charger #{booking.charger.id.substring(0, 4)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{booking.user?.name || "Anonymous"}</div>
                    <div className="text-xs text-muted-foreground">{booking.user?.email || "No email"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{new Date(booking.startTime).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 60000)} mins
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={
                      booking.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : 
                      booking.status === "CONFIRMED" ? "bg-blue-50 text-blue-600 border-blue-200" : ""
                    }>
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    ₹{booking.payment?.amount?.toFixed(2) || booking.totalCost?.toFixed(2) || "0.00"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
