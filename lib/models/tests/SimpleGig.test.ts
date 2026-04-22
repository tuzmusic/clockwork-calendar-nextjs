import SimpleGig, { SimpleGigJson } from "~/data/models/SimpleGig";

const earlierTime = "2024-12-01T18:00:00";
const finalTime = "2024-12-01T21:00:00";

describe("GigWithParts abstract class", () => {
  class simpleGigImpl extends SimpleGig {
    public serialize(): object & SimpleGigJson {
        throw new Error("Method not implemented.");
    }
    public static make(location: string, startDateTime: string, endDateTime: string) {
      return new this(location, startDateTime, endDateTime);
    }
  }

  describe("public data", () => {
    const gig = simpleGigImpl.make("somewhere", earlierTime, finalTime);

    it("has a location", () => {
      expect(gig.getLocation()).toEqual("somewhere");
    });

    it("has a start time", () => {
      expect(gig.getStartTime()).toEqual(earlierTime);
    });

    it("has an end time", () => {
      expect(gig.getEndTime()).toEqual(finalTime);
    });

    it("has an id based on its start date", () => {
      expect(gig.getId()).toEqual("2024-12-01");
    });
  });
});

