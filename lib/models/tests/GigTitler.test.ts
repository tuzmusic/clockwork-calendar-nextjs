import { faker } from "@faker-js/faker";
import { mock } from "vitest-mock-extended";

import FullCalendarGig, { FullCalendarGigJson } from "~/data/models/FullCalendarGig";
import GigTitler from "~/data/models/GigTitler";
import { cocktailHourPartJSON, mockReceptionJSONWithActual } from "~/data/models/tests/testConstants";

const walthamFullAddress = "15 Waltham St, Boston, MA";

describe("GigTitler", () => {
  describe("time", () => {
    it.each([
      { expectedStr: "🚙1h", formatted: "1h", minutes: 60 },
      { expectedStr: "🚙1:05", formatted: "1h5m", minutes: 65 },
      { expectedStr: "🚙1:15", formatted: "1h15m", minutes: 75 },
      { expectedStr: "🚙2:30", formatted: "2h30m", minutes: 150 },
      { expectedStr: "🚙35m", formatted: "35m", minutes: 35 }
    ] satisfies {
      expectedStr: string, minutes: number, formatted: string
    }[])("returns $expectedStr if the gig is $formatted from home", ({ expectedStr, minutes, formatted }) => {

      // make a calendar gig
      const gigJson = mock<FullCalendarGigJson>({
        location: walthamFullAddress,
        parts: [mockReceptionJSONWithActual, cocktailHourPartJSON],
        distanceInfo: {
          fromHome: {
            miles: 1, minutes: minutes, formattedTime: formatted
          }
        }
      });
      const gig = FullCalendarGig.deserialize(gigJson);
      // make a titler with the gig
      const titler = new GigTitler(gig);
      expect(titler.getTimeFromHomeStr()).toEqual(expectedStr);
    });
  });

  function makeTitler(city: string, state: string) {
    const gigJson = mock<FullCalendarGigJson>({
      location: `123 Sesame St, ${city}, ${state}`,
      parts: [mockReceptionJSONWithActual, cocktailHourPartJSON]
    });
    const gig = FullCalendarGig.deserialize(gigJson);
    return new GigTitler(gig);
  }

  describe("location", () => {
    it.each([
      { city: "Concord", state: "NH" },
      { city: "Groton", state: "MA" },
      { city: "Newport", state: "RI" },
      { city: "Portland", state: "ME" },
      { city: "Manchester", state: "VT" }
    ])("returns $state for $city, $state", ({ city, state }) => {
      const titler = makeTitler(city, state);
      expect(titler.getLocationHintStr()).toEqual(state);
    });

    describe("Boston", () => {
      it("returns Boston for a gig in Boston", () => {
        const titler = makeTitler("Boston", "MA");
        expect(titler.getLocationHintStr()).toEqual(GigTitler.abbreviations["Boston"]);
      });

      it.each(["NH", "ME", "RI"])("returns the state for some other Boston in %s", (state) => {
        const titler = makeTitler("Boston", state);
        expect(titler.getLocationHintStr()).toEqual(state);
      });
    });

    describe("Providence", () => {
      it("returns Providence for a gig in Providence", () => {
        const titler = makeTitler("Providence", "RI");
        expect(titler.getLocationHintStr()).toEqual(GigTitler.abbreviations["Providence"]);
      });

      it.each(["NH", "ME", "MA"])("returns the state for some other Providence in %s", (state) => {
        const titler = makeTitler("Providence", state);
        expect(titler.getLocationHintStr()).toEqual(state);
      });
    });

    describe("Cape Cod", () => {
      it.each(GigTitler.CapeCodCities)("returns CC for a gig in %s, MA", (city) => {
        const titler = makeTitler(city, "MA");
        expect(titler.getLocationHintStr()).toEqual("CC");
      });

      it.each(GigTitler.CapeCodCities)("returns the state for a gig in %s in a different state", (city) => {
        const otherState = faker.helpers.arrayElement(["NH", "VT", "CT", "RI", "ME"]);
        const titler = makeTitler(city, otherState);
        expect(titler.getLocationHintStr()).toEqual(otherState);
      });
    });
  });

  describe("Hotel", () => {
    it.each([1, 60, 110, 119])("returns null if the gig is %d minutes from Boston", (minutes) => {
      const gigJson = mock<FullCalendarGigJson>({
        location: walthamFullAddress,
        parts: [mockReceptionJSONWithActual, cocktailHourPartJSON],
        distanceInfo: { fromBoston: { minutes } }
      });
      const gig = FullCalendarGig.deserialize(gigJson);
      const titler = new GigTitler(gig);
      expect(titler.getHotelStr()).toBeNull();
    });

    it.each([120, 121, 160, 210])("returns 🏩 if the gig is %d minutes from Boston", (minutes) => {
      const gigJson = mock<FullCalendarGigJson>({
        location: walthamFullAddress,
        parts: [mockReceptionJSONWithActual, cocktailHourPartJSON],
        distanceInfo: { fromBoston: { minutes } }
      });
      const gig = FullCalendarGig.deserialize(gigJson);
      const titler = new GigTitler(gig);
      expect(titler.getHotelStr()).toEqual("🏩");
    });
  });

  describe("full string", () => {
    it("returns a string for a gig without a hotel", () => {
      const gigJson = mock<FullCalendarGigJson>({
        location: "123 Sesame St, Provincetown, MA", // cape cod
        parts: [mockReceptionJSONWithActual, cocktailHourPartJSON],
        distanceInfo: {
          fromHome: {
            miles: 100, minutes: 75, formattedTime: "1h15m"
          },
          fromBoston: { minutes: 20 } // no hotel
        }
      });
      const gig = FullCalendarGig.deserialize(gigJson);
      const titler = new GigTitler(gig);
      expect(titler.makeTitle()).toEqual("🎹 🚙1:15 CC 100mi");
    });

    it("returns a string for a gig with a hotel", () => {
      const gigJson = mock<FullCalendarGigJson>({
        location: "123 Sesame St, Manchester, VT", // cape cod
        parts: [mockReceptionJSONWithActual, cocktailHourPartJSON],
        distanceInfo: {
          fromHome: {
            miles: 140, minutes: 150, formattedTime: "2h30m"
          },
          fromBoston: { minutes: 200 }
        }
      });
      const gig = FullCalendarGig.deserialize(gigJson);
      const titler = new GigTitler(gig);
      expect(titler.makeTitle()).toEqual("🎹 🚙2:30 VT 🏩 140mi");
    });
  });
});
