'use client'

import { useState } from 'react'
import EventRowUI from './EventRowUI'

interface EventsTableProps {
  eventRows: any[] // EventRowJSON[]
}

export default function EventsTable({ eventRows }: EventsTableProps) {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

  const handleSave = async (eventId: string, gigData: any) => {
    setLoadingIds((prev) => new Set(prev).add(eventId))

    try {
      const response = await fetch('/api/events/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gigData }),
      })

      if (response.ok) {
        // Reload the page to show updated data
        window.location.reload()
      } else {
        alert('Failed to save event')
      }
    } catch (error) {
      console.error('Error saving event:', error)
      alert('An error occurred')
    } finally {
      setLoadingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(eventId)
        return newSet
      })
    }
  }

  const handleUpdate = async (eventId: string, gigData: any) => {
    setLoadingIds((prev) => new Set(prev).add(eventId))

    try {
      const response = await fetch('/api/events/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gigData }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to update event')
      }
    } catch (error) {
      console.error('Error updating event:', error)
      alert('An error occurred')
    } finally {
      setLoadingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(eventId)
        return newSet
      })
    }
  }

  if (eventRows.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No upcoming events found
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {eventRows.map((row) => (
        <EventRowUI
          key={row.emailGig?.id || row.googleGig?.id}
          eventRow={row}
          onSave={handleSave}
          onUpdate={handleUpdate}
          isLoading={loadingIds.has(row.emailGig?.id || row.googleGig?.id)}
        />
      ))}
    </div>
  )
}
