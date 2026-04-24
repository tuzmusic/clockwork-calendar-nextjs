"use server"
import FullCalendarGig, { FullCalendarGigJson } from "@/lib/models/FullCalendarGig";
import DistanceService from "@/lib/services/DistanceService";
import { Reception } from "@/lib/models/GigParts/Reception";
import { EventsActionIntent } from "@/app/events/EventsActionIntent";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function getDistanceInfo(_: unknown, formData: FormData) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const gigStr = formData.get('gig');

  if (!gigStr || typeof gigStr !== 'string') {
    throw new Error('Gig param is missing or isn\'t a string')
  }

  const gigJson = JSON.parse(gigStr) as FullCalendarGigJson;

  // todo deserialize?
  const dummyGig = FullCalendarGig.make({
    location: gigJson.location,
    // distanceService: _distanceService ?? new DistanceService(),
    distanceService: new DistanceService(),
    parts: [
      // we have the gigJson but it's not really worth extracting it to make parts
      // (although we could use makeGigPartsFromJson, sorta)
      new Reception("2024-12-01T19:00:00", "2024-12-01T21:00:00")
    ]
  });

  await dummyGig.fetchDistanceInfo();

  const distanceInfo = dummyGig.getDistanceInfo();

  return {
    id: gigJson.id,
    distanceInfo,
    intent: EventsActionIntent.getDistanceInfo
  }
}
