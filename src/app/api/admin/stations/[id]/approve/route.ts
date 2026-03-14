import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// PUT /api/admin/stations/[id]/approve — approve or reject a pending station
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { action } = await req.json(); // "approve" | "reject"

  const station = await prisma.station.findUnique({ where: { id } });
  if (!station) return NextResponse.json({ error: "Station not found" }, { status: 404 });

  if (action === "approve") {
    await prisma.station.update({ where: { id }, data: { status: "ACTIVE" } });
    return NextResponse.json({ message: "Station approved" });
  } else if (action === "reject") {
    await prisma.station.update({ where: { id }, data: { status: "INACTIVE" } });
    return NextResponse.json({ message: "Station rejected" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
