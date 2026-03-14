import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { JwtPayload } from 'jsonwebtoken';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getCurrentUser();
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = authResult as JwtPayload;
    const { id: bookingId } = await params;

    // Find the charging session via the associated booking
    const chargingSession = await prisma.chargingSession.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            charger: {
              include: {
                station: true
              }
            }
          }
        }
      }
    });

    if (!chargingSession) {
      // It just means it hasn't started yet
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Since mock real-time charging is not implemented, we can dynamically calculate based on `startTime` if ACTIVE
    if (chargingSession.status === 'ACTIVE') {
      const now = new Date();
      const diffMs = now.getTime() - chargingSession.startTime.getTime();
      const durationMins = Math.floor(diffMs / 60000);
      
      const charger = chargingSession.booking.charger;
      // powerKw (e.g., 50), pricePerKwh (e.g., 15)
      const energyUsed = (charger.powerKw * (durationMins / 60)); 
      const cost = energyUsed * charger.pricePerKwh;

      return NextResponse.json({
        ...chargingSession,
        duration: durationMins,
        energyUsed,
        cost
      });
    }

    return NextResponse.json(chargingSession);
  } catch (error) {
    console.error('Error fetching session status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
