import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { JwtPayload } from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const authResult = await getCurrentUser();
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = authResult as JwtPayload;
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    // Check if the booking exists and belongs to the user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        session: true,
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized for this booking' }, { status: 403 });
    }

    if (booking.session) {
      return NextResponse.json({ error: 'Charging session already exists for this booking' }, { status: 400 });
    }

    // Start a transaction to ensure data integrity
    const [chargingSession] = await prisma.$transaction([
      // Create session
      prisma.chargingSession.create({
        data: {
          bookingId: booking.id,
          status: 'ACTIVE',
          startTime: new Date(),
        }
      }),
      // Mark charger as IN_USE
      prisma.charger.update({
        where: { id: booking.chargerId },
        data: { status: 'IN_USE' }
      })
    ]);

    return NextResponse.json({ success: true, session: chargingSession }, { status: 201 });
  } catch (error) {
    console.error('Error starting charging session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
