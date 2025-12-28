import EmailGig from "@/lib/models/EmailGig";
import FullCalendarGig from "@/lib/models/FullCalendarGig";
import GoogleGig from "@/lib/models/GoogleGig";
import DistanceService from "@/lib/services/DistanceService";

export type EventRowJson = ReturnType<EventRow["serialize"]>

export default class EventRow {
  public readonly id: string;

  private constructor(
    private emailGig: EmailGig | undefined,
    private googleGig: GoogleGig | undefined,
    private distanceService: DistanceService
  ) {
    this.id = emailGig?.getId() ?? googleGig?.getId() ?? "new";
  }

  public serialize() {
    return {
      emailGig: this.emailGig?.serialize() ?? null,
      googleGig: this.googleGig?.serialize() ?? null,
      appGig: this.appGig.serialize(),
      id: this.id,
      hasChanged: this.hasChanged,
      hasUpdates: this.hasUpdates
    };
  }

  public getEmailGig() {
    return this.emailGig;
  }

  public getCalendarGig() {
    return this.googleGig;
  }

  public appGig!: FullCalendarGig;

  private get locationsMatch() {
    return this.emailGig?.getLocation() === this.googleGig?.getLocation();
  }

  public get locationHasChanged() {
    return !this.locationsMatch;
  }

  private get partsMatch() {
    const emailParts = this.emailGig?.getParts().map(p => p.serialize());
    const googleParts = this.googleGig?.getPartsJson();
    return JSON.stringify(emailParts) === JSON.stringify(googleParts);
  }

  public get partsHaveChanged() {
    return !this.partsMatch;
  }


  public get hasUpdates() {
    const { googleGig, appGig } = this;
    if (this.hasChanged) return true;

    // if the info hasn't changed, but the google gig is missing info,
    // there's still reason to update the google event.
    if (!googleGig?.getPartsJson()) {
      return true;
    }

    if (!googleGig?.getDistanceInfo() && appGig.getDistanceInfo()) {
      return true;
    }

    return false;
  }

  private _hasChanged!: boolean;

  public get hasChanged() {
    if (this._hasChanged === undefined) {
      this._hasChanged = !this.eventsAreIdentical;
    }
    return this._hasChanged;
  }

  private get eventsAreIdentical() {
    return this.locationsMatch && this.partsMatch;
  }

  public static buildRow(emailGig: EmailGig, googleGig: GoogleGig, distanceService: DistanceService): EventRow
  public static buildRow(emailGig: EmailGig, googleGig: undefined, distanceService: DistanceService): EventRow
  public static buildRow(emailGig: undefined, googleGig: GoogleGig, distanceService: DistanceService): EventRow
  public static buildRow(
    emailGig: EmailGig | undefined,
    googleGig: GoogleGig | undefined,
    distanceService: DistanceService
  ): EventRow {
    if (!emailGig && !googleGig) {
      throw new Error("buildRow was called but neither event is defined.");
    }

    if (!emailGig) {
      throw new Error("Unhandled: email gig is blank");
    }

    const row = new EventRow(emailGig, googleGig, distanceService);

    row.appGig = FullCalendarGig.make({
      location: emailGig.getLocation(),
      parts: emailGig.getParts(),
      isNew: !googleGig,
      googleId: googleGig?.getGoogleId(),
      distanceService
    });

    if (googleGig && row.locationsMatch) {
      const distanceInfo = googleGig.getDistanceInfo();
      if (distanceInfo) {
        row.appGig.setDistanceInfo(distanceInfo);
      }
    }

    return row;
  }
}
