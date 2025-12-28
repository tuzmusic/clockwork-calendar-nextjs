import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getGoogleAuthClient, getSelectedCalendarId } from '@/lib/google-auth'
import GoogleCalendarService from '@/lib/services/GoogleCalendarService'
import DistanceService from '@/lib/services/DistanceService'
import FullCalendarGig from '@/lib/models/FullCalendarGig'

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { gigData } = await request.json()

    if (!gigData) {
      return NextResponse.json({ error: 'Gig data required' }, { status: 400 })
    }

    const calendarId = await getSelectedCalendarId()

    if (!calendarId) {
      return NextResponse.json({ error: 'No calendar selected' }, { status: 400 })
    }

    const authClient = await getGoogleAuthClient()
    const calendarService = new GoogleCalendarService(calendarId, authClient)
    const distanceService = new DistanceService()

    // Deserialize the FullCalendarGig
    const gig = FullCalendarGig.deserialize(gigData, distanceService, calendarService)

    // Update in Google Calendar
    await gig.update()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update event' },
      { status: 500 }
    )
  }
}
