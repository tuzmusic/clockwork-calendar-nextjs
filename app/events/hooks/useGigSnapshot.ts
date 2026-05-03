"use client"

import { useEffect, useState } from "react"
import { EventRowJson } from "@/lib/models/EventRow"

const STORAGE_KEY = "gigSnapshot"

interface GigSnapshot {
  emailId: string
  newIds: string[]
  updatedIds: string[]
}

function buildSnapshot(emailId: string, eventRows: EventRowJson[]): GigSnapshot {
  return {
    emailId,
    newIds: eventRows.filter(r => r.appGig.isNew).map(r => r.id),
    updatedIds: eventRows.filter(r => !r.appGig.isNew && r.hasUpdates).map(r => r.id),
  }
}

export function useGigSnapshot(eventRows: EventRowJson[], emailId: string | null) {
  const [snapshot, setSnapshot] = useState<GigSnapshot | null>(null)

  useEffect(() => {
    if (!emailId) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: GigSnapshot = JSON.parse(stored)
        if (parsed.emailId === emailId) {
          setSnapshot(parsed)
          return
        }
      }
    } catch {
      // corrupt storage — fall through to rebuild
    }

    const fresh = buildSnapshot(emailId, eventRows)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
    } catch {
      // storage unavailable — use in-memory only
    }
    setSnapshot(fresh)
  }, [emailId]) // eslint-disable-line react-hooks/exhaustive-deps

  return snapshot
}
