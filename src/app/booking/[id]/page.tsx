import { notFound, redirect } from "next/navigation";
import BookingConfirmationClient from "./booking-confirmation-client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      charger: {
        include: {
          station: {
            select: { name: true, address: true, city: true, latitude: true, longitude: true },
          },
        },
      },
    },
  });

  if (!booking || booking.userId !== user.userId) {
    notFound();
  }

  return (
    <BookingConfirmationClient
      booking={{
        id: booking.id,
        qrCode: booking.qrCode,
        pin: booking.pin ?? undefined,
        status: booking.status,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        totalCost: booking.totalCost ?? undefined,
        charger: {
          type: booking.charger.type,
          powerKw: booking.charger.powerKw,
        },
        station: {
          name: booking.charger.station.name,
          address: booking.charger.station.address,
          city: booking.charger.station.city,
          latitude: booking.charger.station.latitude,
          longitude: booking.charger.station.longitude,
        },
      }}
    />
  );
}
