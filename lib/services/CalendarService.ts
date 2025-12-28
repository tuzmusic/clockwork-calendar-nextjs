import { GaxiosResponse } from "gaxios";
import { calendar_v3 } from "googleapis";

export default class CalendarService {
  public async postEvent(_json: calendar_v3.Schema$Event): Promise<
    GaxiosResponse<calendar_v3.Schema$Event>
  > {
    throw Error("not implemented");
  }

  public async updateEvent(_eventId: string | null | undefined, _json: calendar_v3.Schema$Event): Promise<
    GaxiosResponse<calendar_v3.Schema$Event>
  > {
    throw Error("not implemented");
  }

  public async getEvents(
    { fromDate: _ }: { fromDate: Date | null }
  ): Promise<calendar_v3.Schema$Event[]> {
    throw Error("not implemented");
  }
}
