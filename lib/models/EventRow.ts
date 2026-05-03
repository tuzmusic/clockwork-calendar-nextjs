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
      hasUpdates: this.hasUpdates,
      timeHasChanged: this.timeHasChanged,
      locationHasChanged: this.locationHasChanged,
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
    return !!(this.googleGig && !this.locationsMatch);
  }

  // Compares the email's computed start/end (accounting for ceremony early start, etc.)
  // against the Google Calendar event's stored start/end. Both sides are timezone-normalized
  // by SimpleGig's constructor, so the string comparison is safe.
  private get timesMatch() {
    return this.emailGig?.getStartTime() === this.googleGig?.getStartTime() &&
      this.emailGig?.getEndTime() === this.googleGig?.getEndTime();
  }

  public get timeHasChanged() {
    return !!(this.googleGig && !this.timesMatch);
  }

  public get hasUpdates() {
    const { googleGig, appGig } = this;
    if (!googleGig) return false;

    return this.timeHasChanged
      || this.locationHasChanged
      || (!googleGig.getDistanceInfo() && !!appGig.getDistanceInfo());
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
