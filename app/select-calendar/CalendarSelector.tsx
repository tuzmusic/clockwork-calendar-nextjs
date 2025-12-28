'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { calendar_v3 } from 'googleapis'

interface CalendarSelectorProps {
  calendars: calendar_v3.Schema$CalendarListEntry[]
}

export default function CalendarSelector({ calendars }: CalendarSelectorProps) {
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCalendarId) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/select-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarId: selectedCalendarId }),
      })

      if (response.ok) {
        router.push('/events')
      } else {
        alert('Failed to save calendar selection')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {calendars.map((calendar) => (
          <label
            key={calendar.id}
            className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
          >
            <input
              type="radio"
              name="calendar"
              value={calendar.id || ''}
              checked={selectedCalendarId === calendar.id}
              onChange={(e) => setSelectedCalendarId(e.target.value)}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="font-medium">{calendar.summary}</div>
              {calendar.description && (
                <div className="text-sm text-gray-500">{calendar.description}</div>
              )}
            </div>
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={!selectedCalendarId || isLoading}
        className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
      >
        {isLoading ? 'Saving...' : 'Continue'}
      </button>
    </form>
  )
}
