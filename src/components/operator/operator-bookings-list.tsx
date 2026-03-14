"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";

export interface OperatorBookingsListProps {
  bookings: {
    id: string;
    startTime: Date;
    endTime: Date;
    status: string;
    totalCost: number | null;
    createdAt: Date;
    station: {
      id: string;
      name: string;
      address: string;
    };
    charger: {
      id: string;
      type: string;
    };
    user: {
      id: string;
      name: string;
      email: string;
    };
    payment: {
      status: string;
      amount: number;
    } | null;
  }[];
}

export function OperatorBookingsList({ bookings }: OperatorBookingsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
        <CardDescription>A comprehensive list of all bookings across your stations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Station</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="font-medium">{booking.station.name}</div>
                      <div className="text-xs text-muted-foreground">Charger #{booking.charger.id.substring(0, 4)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{booking.user.name}</div>
                      <div className="text-xs text-muted-foreground">{booking.user.email}</div>
                    </TableCell>
                    <TableCell>
                      <div>{new Date(booking.startTime).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </TableCell>
                    <TableCell>
                      {Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 60000)} mins
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        booking.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : 
                        booking.status === "CONFIRMED" ? "bg-blue-50 text-blue-600 border-blue-200" : ""
                      }>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{booking.payment?.amount?.toFixed(2) || booking.totalCost?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">Details</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                            <DialogDescription className="flex items-center mt-1">
                              Booking ID: <span className="font-mono text-xs ml-1 mr-2">{booking.id}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5" 
                                onClick={() => navigator.clipboard.writeText(booking.id)}
                              >
                                <CopyIcon className="h-3 w-3" />
                              </Button>
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 pt-4 text-sm">
                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Customer</p>
                                <p className="font-medium">{booking.user.name}</p>
                                <p className="text-xs">{booking.user.email}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Station</p>
                                <p className="font-medium">{booking.station.name}</p>
                                <p className="text-xs text-muted-foreground">{booking.station.address}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Schedule</p>
                                <p className="font-medium">{new Date(booking.startTime).toLocaleString()}</p>
                                <p className="text-xs mt-1">
                                  to {new Date(booking.endTime).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Charger details</p>
                                <p className="font-medium uppercase">{booking.charger.type}</p>
                                <p className="text-xs">#{booking.charger.id.substring(0, 8)}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Status</p>
                                <Badge variant="outline">{booking.status}</Badge>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Payment</p>
                                <p className="font-medium">
                                  ₹{booking.payment?.amount?.toFixed(2) || booking.totalCost?.toFixed(2) || "0.00"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Status: {booking.payment?.status || "Pending"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
