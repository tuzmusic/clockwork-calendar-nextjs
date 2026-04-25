import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { TIME_ZONE } from "@/lib/models/constants";

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(duration);

export default function DayJsTz(dateString: string) {
  // dayjs.tz(str, tz) interprets a naive string directly as the given timezone,
  // whereas dayjs(str).tz(tz) parses as local time first — wrong on non-ET servers/browsers.
  const day = dayjs.tz(dateString, TIME_ZONE);
  if (day.format() === "Invalid Date") {
    throw new Error("Invalid date string passed to dayjs (through DateTime)");
  }
  return day
}
