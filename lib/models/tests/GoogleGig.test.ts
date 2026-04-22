import { calendar_v3 } from "googleapis";

import GoogleGig from "~/data/models/GoogleGig";
import { end, location, mockDistanceData, mockParts, start } from "~/data/models/tests/testConstants";

describe("GoogleGig.make", () => {
  describe("with no extendedProperties", () => {
    const mockData: calendar_v3.Schema$Event = {
      start: { dateTime: start },
      end: { dateTime: end },
      location,
      id: "abcd"
    };

    const gig = GoogleGig.make(mockData);

    it("returns a simple gig", () => {
      expect(gig.getLocation()).toEqual(location);
      expect(gig.getStartTime()).toEqual(start);
      expect(gig.getEndTime()).toEqual(end);
      expect(gig.getId()).toEqual("2024-12-01");
      expect(gig.getGoogleId()).toEqual("abcd");
    });

    it("has the route info as null", () => {
      expect(gig.getDistanceInfo()).toBeNull();
    });

    it("has the parts as null", () => {
      expect(gig.getPartsJson()).toBeNull();
    });

    it("makes has start and end times", () => {
      expect(gig.getStartTime()).toEqual(start);
      expect(gig.getEndTime()).toEqual(end);
    });
  });

  describe("with route info", () => {
    it("populates the route info from the stored gig", () => {
      const mockData: calendar_v3.Schema$Event = {
        start: { dateTime: start },
        end: { dateTime: end },
        location,
        extendedProperties: {
          private: {
            distanceInfo: JSON.stringify(mockDistanceData)
          }
        }
      };

      const gig = GoogleGig.make(mockData);

      expect(gig.getDistanceInfo()).toEqual(mockDistanceData);
    });
  });

  describe("with parts", () => {
    it("populates the parts from the stored gig " +
      "(though it's not clear what we're going to do with them...)", () => {
      const mockData: calendar_v3.Schema$Event = {
        start: { dateTime: start },
        end: { dateTime: end },
        location,
        extendedProperties: {
          private: {
            parts: JSON.stringify(mockParts)
          }
        }
      };

      const gig = GoogleGig.make(mockData);
      expect(gig.getPartsJson()).toEqual(mockParts);
    });
  });
});
