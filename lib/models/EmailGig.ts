import { GigPart } from "@/lib/models/GigParts/GigPart";
import GigWithParts from "@/lib/models/GigWithParts";

export default class EmailGig extends GigWithParts {

  private readonly originalHtml: string | null

  public getOriginalHtml() {
    return this.originalHtml
  }

  constructor(location: string, parts: GigPart[], originalHtml?: string) {
    super(location, parts)
    this.originalHtml = originalHtml ?? null
  }

  static make(location: string, parts: GigPart[], originalHtml?: string) {
    return new this(location, parts, originalHtml);
  }

  public override serialize() {
    return {
      ...super.serialize(),
      originalHtml: this.originalHtml
    };
  }
}
