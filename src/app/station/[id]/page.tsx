import { notFound } from "next/navigation";
import StationDetailClient from "./station-detail-client";
import { prisma } from "@/lib/db";

// Server component — fetches data, passes to client component
export default async function StationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const station = await prisma.station.findUnique({
    where: { id },
    include: {
      operator: { select: { id: true, name: true } },
      chargers: {
        orderBy: [{ status: "asc" }, { powerKw: "desc" }],
        select: {
          id: true,
          type: true,
          powerKw: true,
          pricePerKwh: true,
          status: true,
        },
      },
    },
  });

  if (!station || station.status !== "ACTIVE") {
    notFound();
  }

  const availableCount = station.chargers.filter(
    (c) => c.status === "AVAILABLE"
  ).length;

  return (
    <StationDetailClient
      station={{
        ...station,
        availableChargers: availableCount,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chargers: station.chargers as any,
      }}
    />
  );
}
