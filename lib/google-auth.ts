import { auth, clerkClient } from '@clerk/nextjs/server'
import { google } from 'googleapis'
import { cookies } from 'next/headers'

export async function getGoogleAuthClient() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Not authenticated')
  }

  const client = await clerkClient()
  const tokenResponse = await client.users.getUserOauthAccessToken(userId, 'google')
  const token = tokenResponse.data[0]?.token

  if (!token) {
    throw new Error('No Google OAuth token found')
  }

  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: token })

  return oauth2Client
}

export async function getSelectedCalendarId(): Promise<string | null> {
  const cookieStore = await cookies()
  const calendarId = cookieStore.get('selected-calendar')
  return calendarId?.value || null
}
