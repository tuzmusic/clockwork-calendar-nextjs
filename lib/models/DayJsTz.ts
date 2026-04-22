import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { TIME_ZONE } from "@/lib/models/constants";

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(duration);

export default function DayJsTz(dateString: string) {
  const day = dayjs(dateString).tz(TIME_ZONE);
  if (day.format() === "Invalid Date") {
    throw new Error("Invalid date string passed to dayjs (through DateTime)");
  }
  return day
}
