import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { calendarId } = await request.json()

    if (!calendarId) {
      return NextResponse.json({ error: 'Calendar ID required' }, { status: 400 })
    }

    // Store selected calendar in cookie
    const cookieStore = await cookies()
    cookieStore.set('selected-calendar', calendarId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving calendar selection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
