import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, hashPassword, comparePassword, signToken, setAuthCookie } from "@/lib/auth";
import { cookies } from "next/headers";

// GET /api/user/profile
export async function GET(_req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { id: true, name: true, email: true, phone: true, vehicleType: true, role: true, createdAt: true },
  });

  return NextResponse.json({ profile });
}

// PATCH /api/user/profile — update name, phone, vehicleType (and optionally password)
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, phone, vehicleType, currentPassword, newPassword } = body;

  const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Password change?
  let hashedPassword: string | undefined;
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password required" }, { status: 400 });
    }
    const match = await comparePassword(currentPassword, dbUser.password);
    if (!match) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    hashedPassword = await hashPassword(newPassword);
  }

  const updated = await prisma.user.update({
    where: { id: user.userId },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(vehicleType !== undefined && { vehicleType }),
      ...(hashedPassword && { password: hashedPassword }),
    },
    select: { id: true, name: true, email: true, phone: true, vehicleType: true, role: true },
  });

  // Re-issue JWT with updated name
  const newToken = signToken({
    userId: updated.id,
    email: updated.email,
    role: updated.role,
    name: updated.name,
  });
  const cookie = setAuthCookie(newToken);
  const jar = await cookies();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jar.set(cookie.name, cookie.value, cookie.options as any);

  return NextResponse.json({ profile: updated });
}
