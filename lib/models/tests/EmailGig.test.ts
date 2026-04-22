import EmailGig from "~/data/models/EmailGig";
import { cocktailHourPart, location, receptionPart } from "~/data/models/tests/testConstants";


describe("EmailGig", () => {
  describe("EmailGig.makeWithParts", () => {
    it("can be constructed with parts", () => {
      const parts = [cocktailHourPart, receptionPart];

      const gig = EmailGig.make(location, parts);

      expect(gig.getLocation()).toEqual(location);
      expect(gig.getParts()).toEqual(parts);
    });
  });
});
