'use client'

import { useEffect, useState } from 'react'
import { EventRowJson } from '@/lib/models/EventRow'
import { bulkFetchAndSaveDistances } from '@/app/events/functions/calendarActions'

export function useBulkDistanceFetch(eventRows: EventRowJson[]) {
  const [isFetching, setIsFetching] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const gigsNeedingDistance = eventRows.filter(
      r => r.googleGig && !r.appGig.distanceInfo
    )
    if (gigsNeedingDistance.length === 0) return

    setIsFetching(true)
    setPendingCount(gigsNeedingDistance.length)

    bulkFetchAndSaveDistances(gigsNeedingDistance.map(r => r.appGig))
      .finally(() => setIsFetching(false))
  }, []) // intentionally run once on mount

  return { isFetching, pendingCount }
}
