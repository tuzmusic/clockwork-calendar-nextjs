import { calendar_v3 } from "googleapis";

import { FullDistanceInfoObj } from "@/lib/models/FullCalendarGig";
import { GigPartJSON } from "@/lib/models/GigParts/GigPart";
import SimpleGig, { SimpleGigJson } from "@/lib/models/SimpleGig";

export default class GoogleGig extends SimpleGig<{
  startDateTime: string,
  endDateTime: string
}> {
  private readonly distanceInfo: FullDistanceInfoObj | null = null;
  private readonly partsJson: GigPartJSON[] | null = null;
  private readonly googleId: string;

  public getDistanceInfo() {
    return this.distanceInfo;
  }

  public getPartsJson() {
    return this.partsJson;
  }

  public getGoogleId() {
    return this.googleId;
  }

  private constructor(private googleJson: calendar_v3.Schema$Event) {
    super(
      googleJson.location!,
      googleJson.start!.dateTime!,
      googleJson.end!.dateTime!
    );

    this.googleId = googleJson.id ?? `${googleJson.id}-id`;

    const extendedProps = googleJson.extendedProperties?.private;

    if (extendedProps) {
      if (extendedProps.distanceInfo) {
        this.distanceInfo = JSON.parse(extendedProps.distanceInfo);
      }
      if (extendedProps.parts) {
        this.partsJson = JSON.parse(extendedProps.parts) as GigPartJSON[];
      }
    }
  }

  static make(json: calendar_v3.Schema$Event) {
    return new GoogleGig(json);
  }

  public override serialize():
    { startDateTime: string; endDateTime: string; title: string }
    & SimpleGigJson {
    return {
      id: this.id,
      title: this.googleJson.summary ?? 'Clockwork Gig',
      location: this.location,
      startDateTime: this.startDateTime,
      endDateTime: this.endDateTime
    };
  }
}
