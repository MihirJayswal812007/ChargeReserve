import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "cr_token";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

// ── Tokens ────────────────────────────────────────────────

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// ── Passwords ─────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

// ── Cookie helpers (server components / route handlers) ───

export async function getTokenFromCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? null;
}

export async function getCurrentUser(): Promise<JwtPayload | null> {
  const token = await getTokenFromCookie();
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;

  // Verify the user still exists in the database and is not suspended
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { isSuspended: true },
    });
    if (!dbUser || dbUser.isSuspended) return null;
  } catch (err) {
    console.error("[getCurrentUser db check]", err);
    return null;
  }

  return payload;
}

export function setAuthCookie(token: string): {
  name: string;
  value: string;
  options: object;
} {
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    },
  };
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME;
