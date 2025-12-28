import { GigPart } from "@/lib/models/GigParts/GigPart";

export class Reception extends GigPart {
  constructor(startDateTime: string, endDateTime: string) {
    super("reception", startDateTime, endDateTime);
  }
}
