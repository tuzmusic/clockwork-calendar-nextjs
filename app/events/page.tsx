import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getGoogleAuthClient, getSelectedCalendarId } from '@/lib/google-auth'
import GmailService from '@/lib/services/GmailService'
import GoogleCalendarService from '@/lib/services/GoogleCalendarService'
import DistanceService from '@/lib/services/DistanceService'
import EmailParser from '@/lib/parsers/emailParser/EmailParser'
import EmailGig from '@/lib/models/EmailGig'
import GoogleGig from '@/lib/models/GoogleGig'
import Schedule from '@/lib/models/Schedule'
import EventsTable from './EventsTable'

async function loadEvents() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const calendarId = await getSelectedCalendarId()

  if (!calendarId) {
    redirect('/select-calendar')
  }

  try {
    const authClient = await getGoogleAuthClient()

    // Fetch email and parse
    const gmailService = new GmailService(authClient)
    const emailHtml = await gmailService.getMessageBody()
    const emailGigs = EmailParser.parseEmail(emailHtml)

    // Fetch calendar events
    const calendarService = new GoogleCalendarService(calendarId, authClient)
    const events = await calendarService.getEvents({ fromDate: new Date() })
    const googleGigs = events.map((event) => GoogleGig.make(event))

    // Build schedule
    const distanceService = new DistanceService()
    const schedule = Schedule.build({
      emailGigs,
      remoteGigs: googleGigs,
    }, distanceService)

    return {
      eventRows: schedule.eventSets.map((row) => row.serialize()),
      calendarId,
    }
  } catch (error) {
    console.error('Error loading events:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to load events',
    }
  }
}

export default async function EventsPage() {
  const data = await loadEvents()

  if ('error' in data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{data.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Clockwork Calendar</h1>
          <p className="text-sm text-gray-500 mb-4">
            Calendar: {data.calendarId}
          </p>
          <EventsTable eventRows={data.eventRows} />
        </div>
      </div>
    </div>
  )
}
