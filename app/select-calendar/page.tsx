import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { google } from 'googleapis'
import CalendarSelector from './CalendarSelector'
import { getGoogleAuthClient } from '@/lib/google-auth'

async function getCalendars() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  try {
    const authClient = await getGoogleAuthClient()
    const calendar = google.calendar({ version: 'v3', auth: authClient })
    const response = await calendar.calendarList.list()

    return { calendars: response.data.items || [] }
  } catch (error) {
    console.error('Error fetching calendars:', error)
    return { error: 'Failed to fetch calendars. Please try again.' }
  }
}

export default async function SelectCalendarPage() {
  const data = await getCalendars()

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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Select Your Calendar</h1>
          <p className="text-gray-600 mb-8">
            Choose the Google Calendar where you want to manage your gig schedule.
          </p>
          <CalendarSelector calendars={data.calendars} />
        </div>
      </div>
    </div>
  )
}
