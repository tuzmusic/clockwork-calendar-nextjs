import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { TIME_ZONE } from "@/lib/models/constants";
import { GigPart } from "@/lib/models/GigParts/GigPart";

dayjs.extend(timezone);
dayjs.extend(utc);

export class Ceremony extends GigPart {
  constructor(startDateTime: string, endDateTime: string) {
    super("ceremony", startDateTime, endDateTime);

    // Parse as ET explicitly so server local timezone doesn't affect the result.
    // Format without timezone suffix to keep the string naive (matching all other datetime strings).
    this.actualStartDateTime = dayjs.tz(startDateTime, TIME_ZONE)
      .subtract(30, "minutes")
      .format("YYYY-MM-DDTHH:mm:ss");
  }
}
