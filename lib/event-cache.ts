import fs from 'fs/promises'
import path from 'path'
import { EventRowJson } from "@/lib/models/EventRow";

interface CachedEventData {
  eventRows: EventRowJson[]
  calendarId: string
  emailId: string | null
  cachedAt: number
}

const CACHE_FILE = path.join(process.cwd(), '.next', 'event-cache.json')

export async function readEventCache(): Promise<CachedEventData | null> {
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf-8')
    const data = JSON.parse(raw) as CachedEventData
    const ageSeconds = Math.round((Date.now() - data.cachedAt) / 1000)
    console.log(`[event-cache] HIT — cached ${ageSeconds}s ago`)
    return data
  } catch {
    console.log('[event-cache] MISS — no cache file found')
    return null
  }
}

export async function writeEventCache(data: Omit<CachedEventData, 'cachedAt'>) {
  try {
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true })
    await fs.writeFile(CACHE_FILE, JSON.stringify({ ...data, cachedAt: Date.now() }))
    console.log('[event-cache] WRITE — cache saved')
  } catch (err) {
    console.error('[event-cache] ERROR writing cache:', err)
  }
}

export async function invalidateEventCache() {
  try {
    await fs.unlink(CACHE_FILE)
    console.log('[event-cache] INVALIDATED')
  } catch {
    // file may not exist
  }
}
