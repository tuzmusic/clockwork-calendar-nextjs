import { GigTimeline } from "@/lib/models/GigParts/GigTimeline";
import { Reception } from "@/lib/models/GigParts/Reception";
import {
  cocktailHourPart,
  cocktailStart,
  receptionEnd,
  receptionPart,
  receptionStart
} from "@/lib/models/tests/testConstants";

describe("GigTimeline", () => {
  it("can be initialized empty", () => {
    expect(GigTimeline.make().getParts()).toEqual([]);
  });

  it("can be initialized with a single part", () => {
    expect(GigTimeline.make([receptionPart]).getParts()).toEqual([receptionPart]);
  });

  it("can be initialized with parts, and they are stored in chronological order", () => {
    const timeline = GigTimeline.make([receptionPart, cocktailHourPart]);
    expect(timeline.getParts()[0].type).toEqual("cocktail hour");
    expect(timeline.getParts()[1].type).toEqual("reception");
  });

  it("can add a new part, preserving chronological order", () => {
    const timeline = GigTimeline.make([new Reception(receptionStart, receptionEnd)]);
    timeline.addPart(cocktailHourPart);
    expect(timeline.getParts()[0].type).toEqual("cocktail hour");
  });

  it("returns the start time of the first part as the timeline start", () => {
    const timeline = GigTimeline.make([new Reception(receptionStart, receptionEnd)]);
    timeline.addPart(cocktailHourPart);
    expect(timeline.getStart()).toEqual(cocktailStart);
  });

  it("returns the end time of the first part as the timeline end", () => {
    const timeline = GigTimeline.make([new Reception(receptionStart, receptionEnd)]);
    timeline.addPart(cocktailHourPart);
    expect(timeline.getEnd()).toEqual(receptionEnd);
  });
});
