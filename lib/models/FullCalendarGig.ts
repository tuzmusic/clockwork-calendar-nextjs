import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { LOCATIONS } from "@/lib/models/constants";
import { Ceremony } from "@/lib/models/GigParts/Ceremony";
import { CocktailHour } from "@/lib/models/GigParts/CocktailHour";
import { GigPart } from "@/lib/models/GigParts/GigPart";
import { Reception } from "@/lib/models/GigParts/Reception";
import GigTitler from "@/lib/models/GigTitler";
import GigWithParts from "@/lib/models/GigWithParts";
import { DistanceData, timeObj } from "@/lib/models/types";
import { formatDuration } from "@/lib/models/utilityFunctions";
import CalendarService from "@/lib/services/CalendarService";
import DistanceService from "@/lib/services/DistanceService";

dayjs.extend(duration);

interface MakeFnArgs {
  location: string,
  parts: GigPart[] | null,
  distanceService?: DistanceService
  isNew?: boolean
  googleId?: string
}

export type FullCalendarGigJson = ReturnType<FullCalendarGig["serialize"]>

type DistanceKey = "fromHome" |
  "withWaltham" |
  "walthamDetour" |
  "fromWaltham" |
  "fromBoston";

export type FullDistanceInfoObj = Record<DistanceKey, DistanceData> & {
  isNorthOfHome: boolean;
};
export default class FullCalendarGig extends GigWithParts {
  private distanceService: DistanceService;
  private readonly googleId: string | null;

  public getGoogleId() {
    return this.googleId;
  }

  public static deserialize(gigJson: FullCalendarGigJson): FullCalendarGig {
    const makeParts = (partsJson: FullCalendarGigJson["parts"]) => partsJson.map(json => {
      const { type, startDateTime, endDateTime } = json;
      const ctor = (() => {
        switch (type) {
          case "cocktail hour":
            return CocktailHour;
          case "ceremony":
            return Ceremony;
          case "reception":
            return Reception;
        }
      })();

      return new ctor(startDateTime, endDateTime);
    });

    const gig = this.make({
      location: gigJson.location,
      googleId: gigJson.googleId ?? undefined,
      parts: makeParts(gigJson.parts)
    });

    // todo: would be good to include this in .make but...
    gig._distanceInfo = gigJson.distanceInfo;

    return gig;
  }

  public static make({
      location,
      parts,
      distanceService = new DistanceService(),
      isNew = false,
      googleId
    }: MakeFnArgs
  ) {
    return new FullCalendarGig({
        location,
        parts,
        distanceService,
        googleId
      },
      isNew
    );
  }

  protected constructor({ location, parts, distanceService, googleId }: {
    location: string,
    parts?: GigPart[] | null,
    distanceService: DistanceService
    googleId?: string
  }, public readonly isNew: boolean) {
    super(location, parts ?? []);
    this.googleId = googleId ?? null;
    this.distanceService = distanceService;
  }

  private _distanceInfo: FullDistanceInfoObj | null = null;

  public getDistanceInfo() {
    return this._distanceInfo;
  }

  public setDistanceInfo(distanceInfo: FullDistanceInfoObj) {
    this._distanceInfo = distanceInfo;
  }

  public async fetchDistanceInfo() {
    if (this._distanceInfo) return this._distanceInfo;

    const { distanceService } = this;

    const HOME_LAT = 43.208;
    const venueLatitude = await distanceService.getLatitude(this.location);
    const isNorthOfHome = venueLatitude > HOME_LAT;

    const fromHome = await distanceService.getDistanceInfo({
      from: LOCATIONS.home,
      to: this.location
    });

    const withWaltham = await distanceService.getDistanceInfo({
      from: LOCATIONS.home,
      to: this.location,
      through: LOCATIONS.waltham
    });

    const walthamDetour = {
      miles: withWaltham.miles - fromHome.miles,
      minutes: withWaltham.minutes - fromHome.minutes,
      formattedTime: formatDuration(
        dayjs.duration(
          withWaltham.minutes - fromHome.minutes, "minutes"
        ))
    };

    const fromWaltham = await distanceService.getDistanceInfo({
      from: LOCATIONS.waltham,
      to: this.location
    });

    const fromBoston = await distanceService.getDistanceInfo({
      from: LOCATIONS.boston,
      to: this.location
    });

    this._distanceInfo = {
      isNorthOfHome,
      fromHome,
      withWaltham,
      walthamDetour,
      fromWaltham,
      fromBoston
    };
  }

  public serialize() {
    return {
      ...super.serialize(), // includes parts
      googleId: this.googleId,
      distanceInfo: this._distanceInfo,
      startTime: this.getStartTime(),
      endTime: this.getEndTime(),
      isNew: this.isNew,
    };
  }

  private buildDescription(): string {
    const lines: string[] = [];
    for (const part of this.getParts()) {
      const start = dayjs(part.startDateTime).format("h:mma");
      const end = dayjs(part.endDateTime).format("h:mma");
      const label = part.type.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
      lines.push(`${label}: ${start} – ${end}`);
    }
    const info = this._distanceInfo;
    if (info) {
      lines.push('');
      lines.push(`From home: ${info.fromHome.formattedTime} (${info.fromHome.miles}mi)`);
      if (!info.isNorthOfHome) {
        lines.push(`Via Waltham St: ${info.withWaltham.formattedTime} (${info.withWaltham.miles}mi)`);
        lines.push(`Waltham detour: +${info.walthamDetour.formattedTime} (+${info.walthamDetour.miles}mi)`);
        lines.push(`From Waltham St: ${info.fromWaltham.formattedTime} (${info.fromWaltham.miles}mi)`);
      }
    }
    return lines.join('\n');
  }

  private makePayload() {
    const payload = {
      location: this.location,
      summary: this.getEventTitle(),
      description: this.buildDescription(),
      start: timeObj(this.getStartTime()),
      end: timeObj(this.getEndTime()),
      extendedProperties: {
        private: {
          distanceInfo: JSON.stringify(this.getDistanceInfo()),
          parts: JSON.stringify(this.getPartsJson()),
        }
      }
    };
    return payload;
  }

  public async update(calendarService = new CalendarService()) {
    return await calendarService.updateEvent(this.googleId, this.makePayload());
  }

  public async store(calendarService = new CalendarService()) {
    return await calendarService.postEvent(this.makePayload());
  }

  private getEventTitle() {
    const titler = new GigTitler(this);
    const baseTitle = `Clockwork Gig`;
    return this._distanceInfo
      ? `${titler.makeTitle()} ${baseTitle}`
      : baseTitle;
  }
}
