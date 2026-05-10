import dayjs from "dayjs";
import { GaxiosResponse } from "gaxios";
import { calendar_v3, google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

import CalendarService from "./CalendarService";

export default class GoogleCalendarService extends CalendarService {
  private calendar: calendar_v3.Calendar;

  public constructor(
    private calendarId: string,
    private authClient: OAuth2Client
  ) {
    super();
    this.calendar = google.calendar({
      version: "v3",
      auth: this.authClient
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

  public async postEvent(json: calendar_v3.Schema$Event) {
    return await this.calendar.events.insert({
      calendarId: this.calendarId,
      requestBody: json
    });
  }

  async updateEvent(eventId: string | null | undefined, json: calendar_v3.Schema$Event) {
    if (!eventId) throw Error(`eventId is ${eventId}`);

    return await this.calendar.events.update({
      eventId,
      calendarId: this.calendarId,
      requestBody: json
    });
  }

  async getEvent(eventId: string): Promise<calendar_v3.Schema$Event> {
    const response = await this.calendar.events.get({
      eventId,
      calendarId: this.calendarId,
    });
    return response.data;
  }

  async patchEvent(eventId: string, json: calendar_v3.Schema$Event): Promise<void> {
    await this.calendar.events.patch({
      eventId,
      calendarId: this.calendarId,
      requestBody: json,
    });
  }
}
