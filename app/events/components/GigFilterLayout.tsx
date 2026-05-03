"use client"

import { useState } from "react"
import { EventRowJson } from "@/lib/models/EventRow"
import { EventsTable } from "@/app/events/components/EventsTable"
import { DesktopFilterTabs, FilterTab, MobileFilterTabs } from "@/app/events/components/GigFilterTabs"
import { useGigSnapshot } from "@/app/events/hooks/useGigSnapshot"

interface Props {
  eventRows: EventRowJson[]
  emailId: string | null
}

export function GigFilterLayout({ eventRows, emailId }: Props) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const snapshot = useGigSnapshot(eventRows, emailId)

  const counts = {
    new: snapshot?.newIds.length ?? 0,
    updated: snapshot?.updatedIds.length ?? 0,
    all: eventRows.length,
  }

  const filteredRows = (() => {
    if (!snapshot || activeTab === "all") return eventRows
    if (activeTab === "new") return eventRows.filter(r => snapshot.newIds.includes(r.id))
    return eventRows.filter(r => snapshot.updatedIds.includes(r.id))
  })()

  const tabProps = { activeTab, counts, onTabChange: setActiveTab }

  return (
    <>
      <MobileFilterTabs {...tabProps} />

      <div className="flex gap-4 items-start">
        <DesktopFilterTabs {...tabProps} />
        <div className="flex-1">
          <EventsTable eventRows={filteredRows} />
        </div>
      </div>
    </>
  )
}
