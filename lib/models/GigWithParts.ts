import { GigPart, GigPartJSON } from "@/lib/models/GigParts/GigPart";
import { GigTimeline } from "@/lib/models/GigParts/GigTimeline";
import SimpleGig from "@/lib/models/SimpleGig";

export default abstract class GigWithParts extends SimpleGig<{
    parts: GigPartJSON[]
  }> {
  protected timeline: GigTimeline;

  protected constructor(protected location: string, parts: GigPart[]) {
    const timeline = GigTimeline.make(parts);
    super(location, timeline.getStart(), timeline.getEnd());
    this.timeline = timeline;
  }

  public getParts() {
    return this.timeline.getParts();
  }

  public getPartsJson() {
    return this.getParts().map(p => p.serialize());
  }

  // For sending to client. Use #store to post to storage
  public override serialize() {
    return {
      id: this.id,
      location: this.location,
      parts: this.getPartsJson()
    };
  }
}
