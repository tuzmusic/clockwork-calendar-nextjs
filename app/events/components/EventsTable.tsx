"use client"

import { EventRowJson } from "@/lib/models/EventRow";
import { EventRowUI } from "@/app/events/components/EventRowUI";

export function EventsTable({ eventRows, savedIds, onGigSaved }: {
  eventRows: EventRowJson[]
  savedIds: Set<string>
  onGigSaved: (id: string) => void
}) {
  return (
    <div data-testid="EVENTS_TABLE" className="grid items-start gap-3">
      <div className={
        "hidden sm:grid grid-cols-3 gap-3 font-bold "
        + "*:bg-gray-200 *:w-full *:p-2"
      }>
        <h2>Email</h2>
        <h2 className="text-center">Final</h2>
        <h2 className="text-right">Calendar</h2>
      </div>

      {eventRows.map((row) => (
        <EventRowUI
          row={row}
          key={row.id}
          isSavedThisSession={savedIds.has(row.id)}
          onGigSaved={onGigSaved}
        />
      ))}
    </div>
  );
}
