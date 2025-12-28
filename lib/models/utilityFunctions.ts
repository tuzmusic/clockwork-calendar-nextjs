import { Duration } from "dayjs/plugin/duration";

export function formatDuration(duration: Duration) {
  const hours = duration.hours()
  const minutes = duration.minutes()

  const parts = []
  if (hours) parts.push(`${hours}h`)
  if (minutes) parts.push(`${minutes}m`)

  return parts.join(' ')
}
