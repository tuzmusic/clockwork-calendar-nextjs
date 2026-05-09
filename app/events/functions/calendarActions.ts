"use server"

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import FullCalendarGig, { FullCalendarGigJson } from "@/lib/models/FullCalendarGig";
import { getGoogleAuthClient, getSelectedCalendarId } from "@/lib/google-auth";
import GoogleCalendarService from "@/lib/services/GoogleCalendarService";
import { revalidatePath } from "next/cache";
import { invalidateEventCache } from "@/lib/event-cache";

export const saveNewGig = makeCalendarAction('store')
export const updateGig = makeCalendarAction('update')

export async function bulkFetchAndSaveDistances(gigJsons: FullCalendarGigJson[]) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const calendarId = await getSelectedCalendarId()
  if (!calendarId) redirect('/select-calendar')
  const authClient = await getGoogleAuthClient()
  const calendarService = new GoogleCalendarService(calendarId, authClient)

  for (const gigJson of gigJsons) {
    const gig = FullCalendarGig.deserialize(gigJson)
    await gig.fetchDistanceInfo()
    await gig.update(calendarService)
  }

  await invalidateEventCache()
  revalidatePath('/events')
}

function makeCalendarAction(intent: 'store' | 'update') {
  return async function (_: unknown, formData: FormData) {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const calendarId = await getSelectedCalendarId()
    if (!calendarId) redirect('/select-calendar')

    const gigStr = formData.get('gig');

    if (!gigStr || typeof gigStr !== 'string') {
      throw new Error('Gig param is missing or isn\'t a string')
    }

    const gigJson = JSON.parse(gigStr) as FullCalendarGigJson;
    const gig = FullCalendarGig.deserialize(gigJson);

    try {
      const authClient = await getGoogleAuthClient()
      const calendarService = new GoogleCalendarService(calendarId, authClient)
      await gig[intent](calendarService);

      await invalidateEventCache()
      revalidatePath('/events')
      return { success: true, id: gig.getId() };
    } catch (error) {
      console.error('Error writing new gig:', error)
      return { error: 'Failed to write new gig. Please try again.' }
    }
  }
}
