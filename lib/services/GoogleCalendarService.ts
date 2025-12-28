import dayjs from "dayjs";
import { GaxiosResponse } from "gaxios";
import { calendar_v3, google } from "googleapis";

import { oauth2Client } from "~/auth/auth0.server";
import CalendarService from "@/lib/services/CalendarService";

export default class GoogleCalendarService extends CalendarService {
  private calendar: calendar_v3.Calendar;

  public constructor(private calendarId: string) {
    super();
    this.calendar = google.calendar({
      version: "v3",
      auth: oauth2Client
    });
  }

  public async getEvents(
    { fromDate }: { fromDate: Date | null }
  ): Promise<calendar_v3.Schema$Event[]> {
    const calResponse = await this.calendar.events.list({
      calendarId: this.calendarId,
      singleEvents: true,
      q: "Clockwork Gig",
      orderBy: "startTime",
      timeMin: (fromDate ? dayjs(fromDate) : dayjs()).toISOString()
    });

    return calResponse?.data?.items ?? [];
  }

  public async postEvent(json: calendar_v3.Schema$Event): Promise<GaxiosResponse<calendar_v3.Schema$Event>> {
    return await this.calendar.events.insert({
      calendarId: this.calendarId,
      requestBody: json
    });
  }

  async updateEvent(eventId: string | null | undefined, json: calendar_v3.Schema$Event):
    Promise<GaxiosResponse<calendar_v3.Schema$Event>> {
    if (!eventId) throw Error(`eventId is ${eventId}`);

    return await this.calendar.events.update({
      eventId,
      calendarId: this.calendarId,
      requestBody: json
    });
  }
}
