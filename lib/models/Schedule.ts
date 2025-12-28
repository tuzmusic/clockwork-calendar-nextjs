import EmailGig from "@/lib/models/EmailGig";
import EventRow from "@/lib/models/EventRow";
import GoogleGig from "@/lib/models/GoogleGig";
import SimpleGig from "@/lib/models/SimpleGig";
import DistanceService from "@/lib/services/DistanceService";

export default class Schedule {
  private readonly emailGigsTable: Record<string, EmailGig>;
  private readonly remoteGigsTable: Record<string, GoogleGig>;
  public readonly eventSets: EventRow[];

  private makeTableById<T extends SimpleGig<unknown>>(gigs: T[]): Record<string, T> {
    return gigs.reduce((acc, gig) => ({
      ...acc, [gig.getId()]: gig
    }), {});
  }

  private constructor(
    private emailGigs: EmailGig[],
    private remoteGigs: GoogleGig[],
    private distanceService: DistanceService
  ) {
    this.emailGigsTable = this.makeTableById(emailGigs);
    this.remoteGigsTable = this.makeTableById(remoteGigs);
    this.eventSets = this.makeEventSets();
  }

  public static build(arrays: { emailGigs: EmailGig[]; remoteGigs: GoogleGig[]; }, distanceService: DistanceService) {
    return new Schedule(arrays.emailGigs, arrays.remoteGigs, distanceService);
  }

  private makeEventSets() {
    const rowsFromEmailGigs = Object.keys(this.emailGigsTable).map(id => {
      const emailGig = this.emailGigsTable[id];
      const remoteGig = this.remoteGigsTable[id];
      return EventRow.buildRow(emailGig, remoteGig, this.distanceService);
    });

    // todo: find orphaned calendar gigs

    return rowsFromEmailGigs;
  }
}
