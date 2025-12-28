import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { TimeObj } from "@/lib/models/types";

dayjs.extend(timezone);
dayjs.extend(utc);

export default class DateTime {
  public static makeGoogleDateFromTime(
    timeStr: string,
    dateParts: { date: number, month: string, year: number }
  ) {
    const { date, month, year } = dateParts;

    // we assume that all events start after 1pm,
    // and that all events end before 1am,
    // and therefore "12" represents the midnight hour of the next day.
    const [_hour, minute] = timeStr.split(":");
    const hour = Number(_hour);
    const am = hour === 12;

    // month is a string (i.e., 'July'), plus dates are easy
    const dateStr = dayjs(`${month} ${date} ${year}`)
      .add(am ? 1 : 0, "day")
      .format("YYYY-MM-DD");

    const hour24 = hour === 12 ? 0 : hour + 12;
    const hourStr = hour24.toString().padStart(2, "0");
    const finalDateStr = `${dateStr}T${hourStr}:${minute}:00`;

    return {
      dateTime: finalDateStr,
      timeZone: "America/New_York"
    } satisfies TimeObj;
  }

}
