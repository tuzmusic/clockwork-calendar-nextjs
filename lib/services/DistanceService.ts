import { Client } from "@googlemaps/google-maps-services-js";
import dayjs from "dayjs";

import { DistanceData } from "../models/types";
import { formatDuration } from "../models/utilityFunctions";

export default class DistanceService {
  public async getDistanceInfo({ from, to, through }: {
    from: string
    to: string
    through?: string
  }): Promise<DistanceData> {
    const METERS_PER_MILE = 1608;

    // throw new Error('getDistanceInfo not implemented')


    /** https://developers.google.com/maps/documentation/directions/get-directions */

    const mapsClient = new Client({});
    const response = await mapsClient.directions({
      params: {
        key: process.env.GOOGLE_API_KEY!,
        origin: from,
        destination: to,
        waypoints: through ? [through] : []
      }
    });
    const { legs } = response.data.routes[0];

    const legValueSum = legs.reduce((acc, leg) => acc + leg.duration.value, 0);
    const duration = dayjs.duration(
      // duration.text is human-readable, but we're doing math on it so we can't use it
      legValueSum, 'seconds'
    );

    const miles = legs.reduce((acc, leg) => acc + leg.distance.value / METERS_PER_MILE, 0);

    return {
      miles: Math.ceil(miles),
      minutes: Math.round(duration.asMinutes()),
      formattedTime: formatDuration(duration)
    };
  }
}
