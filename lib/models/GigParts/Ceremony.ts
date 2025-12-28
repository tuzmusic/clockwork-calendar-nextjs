import dayjs from "dayjs";

import { GigPart } from "@/lib/models/GigParts/GigPart";

export class Ceremony extends GigPart {
  constructor(startDateTime: string, endDateTime: string) {
    super("ceremony", startDateTime, endDateTime);

    const writtenStartDay = dayjs(startDateTime);
    const actualStartDay = writtenStartDay.subtract(30, "minutes");

    this.actualStartDateTime = actualStartDay.format()
      // remove time zone suffix
      .replace(/(:00)-0.*/, "$1");
  }
}
