import { GigPartType } from "@/lib/models/types";

export interface GigPartJSON {
  type: GigPartType;
  startDateTime: string;
  endDateTime: string;
  actualStartDateTime: string;
  actualEndDateTime: string;
}

export abstract class GigPart {
  public actualStartDateTime: string;
  public actualEndDateTime: string;

  public constructor(
    public readonly type: GigPartType,
    public readonly startDateTime: string,
    public readonly endDateTime: string
  ) {
    this.actualStartDateTime = startDateTime;
    this.actualEndDateTime = endDateTime;
  }

  public serialize() {
    const {
      type,
      actualEndDateTime,
      actualStartDateTime,
      endDateTime,
      startDateTime
    } = this;

    return {
      type,
      startDateTime,
      endDateTime,
      actualStartDateTime,
      actualEndDateTime
    } satisfies GigPartJSON;
  }
}
