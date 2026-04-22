import { calendar_v3 } from "googleapis";
import { mock } from "vitest-mock-extended";

import { TIME_ZONE } from "~/data/models/constants";
import { getDistanceServiceWithMocks } from "~/data/models/DistanceFixtureService.ts/testUtils";
import FullCalendarGig, { FullCalendarGigJson } from "~/data/models/FullCalendarGig";
import { CocktailHour } from "~/data/models/GigParts/CocktailHour";
import { Reception } from "~/data/models/GigParts/Reception";
import {
  cocktailHourPart,
  cocktailHourPartJSON,
  location,
  mockReceptionJSONWithActual,
  mockReceptionPart,
  receptionPart
} from "~/data/models/tests/testConstants";
import { DistanceData } from "~/data/models/types";
import CalendarFixtureService from "~/data/services/CalendarFixtureService";
import DistanceService from "~/data/services/DistanceService";

describe("FullCalendarGig.make", () => {
  describe("deserialize", () => {
    const gigJson = mock<FullCalendarGigJson>({
        id: "12-34-2029", // calculation doesn't matter, right?
        location: "Boston",
        parts: [mockReceptionJSONWithActual, cocktailHourPartJSON],
        distanceInfo: {
          fromBoston: {
            miles: 1, minutes: 2, formattedTime: "foo"
          }
        }
      }
    );

    const gig = FullCalendarGig.deserialize(gigJson);
    const parts = gig.getParts();

    test("location", () => {
      expect(gig.getLocation()).toEqual("Boston");
    });

    test("ID", () => {
      expect(gig.getId()).toEqual(
        // not good testing since this reproduces the implementation
        // but whatever
        mockReceptionJSONWithActual.actualStartDateTime.split("T")[0]
      );
    });

    test("parts", () => {
      expect(parts[0]).toBeInstanceOf(CocktailHour);
      expect(parts[1]).toBeInstanceOf(Reception);
      expect(parts[0]).toEqual(cocktailHourPart);
      expect(parts[1]).toEqual(mockReceptionPart);
    });

    test("distanceInfo", () => {
      expect(gig.getDistanceInfo()).toEqual(gigJson.distanceInfo);
    });
  });

  describe("distance info", () => {
    test("It gets distance info from the Distance Service", async () => {
      const distanceService = mock<DistanceService>();
      distanceService.getDistanceInfo.mockResolvedValue({
        miles: 10, minutes: 60, formattedTime: "1h"
      } satisfies DistanceData);

      const fullGig = FullCalendarGig.make({
        location,
        parts: [receptionPart],
        distanceService
      });

      expect(distanceService.getDistanceInfo).not.toHaveBeenCalled();
      await fullGig.fetchDistanceInfo();
      expect(distanceService.getDistanceInfo).toHaveBeenCalled();
    });

    const it = test.extend<{ makeGig: (googleId?: string) => Promise<FullCalendarGig> }>({
      makeGig: async ({ task: _ }, use) => await use(async (googleId) => {
        const distanceService = getDistanceServiceWithMocks(location);
        const newGig = FullCalendarGig.make({
          location,
          parts: [receptionPart],
          distanceService,
          ...(googleId && { googleId })
        });

        await newGig.fetchDistanceInfo();
        const distanceInfo = newGig.getDistanceInfo();
        if (!distanceInfo) {
          throw Error("Fetched route info but it is null");
        }
        return newGig;
      })
    });

    describe("Gets the correct distance info", () => {
      it("withWaltham", async ({ makeGig }) => {
        expect((await makeGig()).getDistanceInfo()?.withWaltham).toEqual({
          miles: expect.any(Number),
          minutes: 120,
          formattedTime: "2h"
        });
      });

      it("fromHome", async ({ makeGig }) => {
        expect((await makeGig()).getDistanceInfo()?.fromHome).toEqual({
          miles: expect.any(Number),
          minutes: 90,
          formattedTime: "1h 30m"
        });
      });

      it("fromWaltham", async ({ makeGig }) => {
        expect((await makeGig()).getDistanceInfo()?.fromWaltham).toEqual({
          miles: expect.any(Number),
          minutes: 45,
          formattedTime: "45m"
        });
      });

      it("walthamDetour", async ({ makeGig }) => {
        expect((await makeGig()).getDistanceInfo()?.walthamDetour).toEqual({
          miles: 10,
          minutes: 30,
          formattedTime: "30m"
        });
      });

      it("fromBoston", async ({ makeGig }) => {
        expect((await makeGig()).getDistanceInfo()?.fromBoston).toEqual({
          miles: 65,
          minutes: 70,
          formattedTime: "1h 10m"
        });
      });
    });

    describe.each([
      ["Saving", "postEvent", "store", 0],
      ["Updating", "updateEvent", "update", 1]
    ] as const)
    ("%s the event", (action, serviceFnName, methodName, argIndex) => {
      const calendarService = new CalendarFixtureService();
      const serviceFnMock = vi.spyOn(calendarService, serviceFnName);
      const id = "abcd";
      const testCall = async (gig: FullCalendarGig) => {
        vi.resetAllMocks();
        await gig[methodName](calendarService);
        expect(serviceFnMock).toHaveBeenCalledOnce();
        return serviceFnMock.mock.calls[0];
      };

      it.runIf(action === "Updating")("includes the event id", async ({ makeGig }) => {
        const call = await testCall(await makeGig(id));
        expect(call[0]).toEqual(id);
      });

      it("includes the location in the payload as extendedProperties", async ({ makeGig }) => {
        const call = await testCall(await makeGig(id));
        expect(call[argIndex]).toMatchObject({ location });
      });

      it("includes the title in the payload", async ({ makeGig }) => {
        const gig = await makeGig(id);
        const call = await testCall(gig);

        // sanity checks
        expect(gig.getDistanceInfo()!.fromHome.minutes).toEqual(90)
        expect(gig.getDistanceInfo()!.fromBoston.miles).toBeLessThan(120)
        expect(gig.getLocation()).toContain('NH')

        expect(call[argIndex]).toMatchObject({ summary: "🎹 🚙1:30 NH 100mi Clockwork Gig" });
      });

      it("includes the startTime the payload as extendedProperties", async ({ makeGig }) => {
        const call = await testCall(await makeGig(id));
        expect(call[argIndex]).toMatchObject({
          start: {
            dateTime: receptionPart.startDateTime,
            timeZone: TIME_ZONE
          }
        });
      });

      it("includes the endTime the payload as extendedProperties", async ({ makeGig }) => {
        const call = await testCall(await makeGig(id));
        expect(call[argIndex]).toMatchObject({
          end: {
            dateTime: receptionPart.endDateTime,
            timeZone: TIME_ZONE
          }
        });
      });

      it("includes the route info in the payload as extendedProperties", async ({ makeGig }) => {
        const call = await testCall(await makeGig());
        const distanceInfoStr = (call[argIndex] as calendar_v3.Schema$Event).extendedProperties!.private!.distanceInfo!;
        expect(distanceInfoStr.length).toBeLessThanOrEqual(1024);

        const distanceInfo = JSON.parse(distanceInfoStr);
        expect(distanceInfo).toMatchObject({
          withWaltham: expect.objectContaining({
            miles: expect.any(Number),
            minutes: expect.any(Number),
            formattedTime: expect.any(String)
          })
        });
      });
    });
  });

  // storing extended props (for new gig only, right?)
  describe.todo("Event Parts");

})
;
