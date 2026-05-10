"use server"

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import FullCalendarGig, { FullCalendarGigJson, FullDistanceInfoObj } from "@/lib/models/FullCalendarGig";
import { getGoogleAuthClient, getSelectedCalendarId } from "@/lib/google-auth";
import GoogleCalendarService from "@/lib/services/GoogleCalendarService";
import { revalidatePath } from "next/cache";
import { invalidateEventCache } from "@/lib/event-cache";
import { GigPartJSON } from "@/lib/models/GigParts/GigPart";
import DayJsTz from "@/lib/models/DayJsTz";

export const saveNewGig = makeCalendarAction('store')
export const updateGig = makeCalendarAction('update')

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

function capitalize(str: string) {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function buildPartsText(parts: GigPartJSON[]): string {
  return parts.map(part => {
    const { actualEndDateTime, startDateTime, actualStartDateTime, endDateTime, type } = part;
    const [writtenStart, writtenEnd, actualStart, actualEnd] = [
      startDateTime, endDateTime, actualStartDateTime, actualEndDateTime
    ].map(d => DayJsTz(d).format("h:mma"));

    const showWritten = (writtenStart !== actualStart) || (writtenEnd !== actualEnd);
    let line = `${capitalize(type)}: ${actualStart}-${actualEnd}`;
    if (showWritten) line += `\n("${writtenStart}-${writtenEnd}")`;
    return line;
  }).join('\n');
}

const distanceLabels: Record<string, string> = {
  fromHome: 'From Home',
  withWaltham: 'Total including Waltham St.',
  walthamDetour: 'Detour to Waltham St.',
  fromWaltham: 'Time from Waltham St.',
};

function buildDistanceText(distanceInfo: FullDistanceInfoObj): string {
  const lines = (['fromHome', 'withWaltham', 'walthamDetour', 'fromWaltham'] as const)
    .map(key => `${distanceLabels[key]}: ${distanceInfo[key].formattedTime}`);
  return `Distances:\n${lines.join('\n')}`;
}

export const updateEventDescription = async (_: unknown, formData: FormData) => {
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

  const googleId = gig.getGoogleId();
  if (!googleId) return { error: 'Event has no Google ID' };

  try {
    const authClient = await getGoogleAuthClient()
    const calendarService = new GoogleCalendarService(calendarId, authClient)

    const existingEvent = await calendarService.getEvent(googleId);
    const existingDescription = existingEvent.description ?? '';

    const partsText = buildPartsText(gig.getPartsJson());
    const distanceInfo = gig.getDistanceInfo();
    const distanceText = distanceInfo ? buildDistanceText(distanceInfo) : null;

    const sections = [existingDescription, partsText, distanceText].filter(Boolean);
    const newDescription = sections.join('\n\n');

    await calendarService.patchEvent(googleId, { description: newDescription });

    await invalidateEventCache()
    revalidatePath('/events')
    return { success: true, id: googleId };
  } catch (error) {
    console.error('Error updating event description:', error)
    return { error: 'Failed to update event description. Please try again.' }
  }
}
