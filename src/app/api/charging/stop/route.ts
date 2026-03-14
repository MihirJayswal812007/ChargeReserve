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

    // Check if the booking exists and get associated session/charger data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        session: true,
        charger: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized for this booking' }, { status: 403 });
    }

    const { session, charger } = booking;

    if (!session) {
      return NextResponse.json({ error: 'Session not started' }, { status: 400 });
    }

    if (session.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Session already completed' }, { status: 400 });
    }

    // Calculate final metrics
    const endTime = new Date();
    const diffMs = endTime.getTime() - session.startTime.getTime();
    const durationMins = Math.floor(diffMs / 60000);
    
    // Fallback constants if needed, but normally use DB
    const powerKw = charger.powerKw || 50;
    const pricePerKwh = charger.pricePerKwh || 0.15;
    
    const energyUsed = (powerKw * (durationMins / 60));
    const cost = energyUsed * pricePerKwh;

    // Execute multiple updates in a transaction
    const [updatedSession] = await prisma.$transaction([
      // 1. Update session to completed
      prisma.chargingSession.update({
        where: { id: session.id },
        data: {
          status: 'COMPLETED',
          endTime,
          duration: durationMins,
          energyUsed,
          cost
        }
      }),
      // 2. Mark booking as completed, assign totalCost
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'COMPLETED',
          totalCost: cost
        }
      }),
      // 3. Mark charger back to available
      prisma.charger.update({
        where: { id: charger.id },
        data: {
          status: 'AVAILABLE'
        }
      })
    ]);

    return NextResponse.json({ success: true, session: updatedSession });
  } catch (error) {
    console.error('Error stopping charging session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
