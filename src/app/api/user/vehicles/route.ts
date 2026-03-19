import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error("Fetch vehicles error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const { make, model, year, connectorType, licensePlate } = json;

    if (!make || !model || !connectorType) {
      return NextResponse.json(
        { error: "Make, model, and connector type are required" },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        userId: user.userId,
        make,
        model,
        year: year ? parseInt(year.toString(), 10) : null,
        connectorType,
        licensePlate: licensePlate || null,
      },
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error) {
    console.error("Create vehicle error:", error);
    return NextResponse.json(
      { error: "Failed to create vehicle" },
      { status: 500 }
    );
  }
}
