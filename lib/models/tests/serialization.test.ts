import { mock } from "vitest-mock-extended";

import EmailGig from "~/data/models/EmailGig";
import { EventRowJson } from "~/data/models/EventRow";
import FullCalendarGig from "~/data/models/FullCalendarGig";
import { GigPartJSON } from "~/data/models/GigParts/GigPart";
import GoogleGig from "~/data/models/GoogleGig";
import {
  cocktailEnd,
  cocktailHourPart,
  cocktailStart,
  end,
  location,
  mockDistanceData,
  mockParts,
  receptionEnd,
  receptionPart,
  receptionStart,
  start
} from "~/data/models/tests/testConstants";
import { DistanceData } from "~/data/models/types";
import DistanceService from "~/data/services/DistanceService";

const cocktailJson: GigPartJSON = {
  type: "cocktail hour",
  startDateTime: cocktailStart,
  actualStartDateTime: cocktailStart,
  endDateTime: cocktailEnd,
  actualEndDateTime: cocktailEnd
};
const receptionJson: GigPartJSON = {
  type: "reception",
  startDateTime: receptionStart,
  actualStartDateTime: receptionStart,
  endDateTime: receptionEnd,
  actualEndDateTime: receptionEnd
};

describe("serializers", () => {
  describe("EmailGig#serialize", () => {
    it("returns the json", () => {
      const gig = EmailGig.make(location, [cocktailHourPart, receptionPart]);
      expect(gig.serialize()).toEqual({
        location,
        id: receptionStart.split("T").shift(),
        originalHtml: null, // todo (in test)
        parts: [
          {
            type: "cocktail hour",
            startDateTime: cocktailStart,
            actualStartDateTime: cocktailStart,
            endDateTime: cocktailEnd,
            actualEndDateTime: cocktailEnd
          },
          {
            type: "reception",
            startDateTime: receptionStart,
            actualStartDateTime: receptionStart,
            endDateTime: receptionEnd,
            actualEndDateTime: receptionEnd
          }
        ] satisfies GigPartJSON[]
      });
    });
  });

  describe("GoogleGig#serialize", () => {
    it("returns the json (without any extended info)", () => {
      const gig = GoogleGig.make({
        start: { dateTime: start },
        end: { dateTime: end },
        location,
        extendedProperties: {
          private: {
            distanceInfo: JSON.stringify(mockDistanceData),
            parts: JSON.stringify(mockParts)
          }
        }
      });
      expect(gig.serialize()).toEqual({
        location,
        startDateTime: start,
        endDateTime: end,
        id: receptionStart.split("T").shift()!,
        title: 'Clockwork Gig', // fallback title value
      } satisfies EventRowJson['googleGig']);
    });
  });

  describe("FullCalendarGig#serialize", () => {
    it("returns the json", async () => {
      const mockDistanceService = mock<DistanceService>();
      mockDistanceService.getDistanceInfo.mockResolvedValue(
        { minutes: 90, formattedTime: "1h 30m", miles: 100 }
      );

      const anyMiles = {
        miles: expect.any(Number),
        minutes: expect.any(Number),
        formattedTime: expect.any(String)
      } satisfies DistanceData;

      const googleId = 'abcd';
      const gig = FullCalendarGig.make({
        location,
        parts: [cocktailHourPart, receptionPart],
        distanceService: mockDistanceService,
        isNew: true,
        googleId
      });

      await gig.fetchDistanceInfo()

      expect(gig.serialize()).toEqual({
        location,
        distanceInfo: {
          fromHome: anyMiles,
          withWaltham: anyMiles,
          walthamDetour: anyMiles,
          fromWaltham: anyMiles,
          fromBoston: anyMiles
        },
        id: receptionStart.split("T").shift(),
        googleId,
        startTime: cocktailHourPart.startDateTime,
        endTime: receptionPart.endDateTime,
        parts: [
          cocktailJson,
          receptionJson
        ] satisfies GigPartJSON[]
      });
    });
  });
});
