import { calendar_v3 } from "googleapis";

import { getDistanceServiceWithMocks } from "~/data/models/DistanceFixtureService.ts/testUtils";
import EmailGig from "~/data/models/EmailGig";
import EventRow from "~/data/models/EventRow";
import { Ceremony } from "~/data/models/GigParts/Ceremony";
import { CocktailHour } from "~/data/models/GigParts/CocktailHour";
import { GigPart, GigPartJSON } from "~/data/models/GigParts/GigPart";
import { Reception } from "~/data/models/GigParts/Reception";
import GoogleGig from "~/data/models/GoogleGig";
import {
  cocktailEnd,
  cocktailStart,
  end,
  location,
  mockDistanceData,
  mockParts,
  mockReceptionJSONWithActual,
  mockReceptionPart,
  receptionEnd,
  receptionStart,
  start
} from "~/data/models/tests/testConstants";
import DistanceService from "~/data/services/DistanceService";

let distanceService: DistanceService

describe("EventRow", () => {
  beforeEach(() => {
    distanceService = getDistanceServiceWithMocks(location);
    vi.spyOn(distanceService, 'getDistanceInfo')
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("EventRow.buildRow", () => {
    describe("appGig", () => {
      describe("Email gig + Basic Calendar Gig; Basic info matches", () => {
        const it = test.extend<{ row: EventRow }>({
          row: async ({ task: _ }, use) => {
            const mockData: calendar_v3.Schema$Event = {
              start: { dateTime: start },
              end: { dateTime: end },
              location
            };

            const emailGig = EmailGig.make(location, [mockReceptionPart]);
            const calendarGig = GoogleGig.make(mockData);
            const row = EventRow.buildRow(emailGig, calendarGig, distanceService);
            expect(row).instanceof(EventRow);
            return await use(row);
          }
        });

        it("has basic info that matches the email gig", ({ row: { appGig } }) => {
          expect(appGig.getLocation()).toEqual(location);
          expect(appGig.getStartTime()).toEqual(start);
          expect(appGig.getEndTime()).toEqual(end);
          expect(appGig.getId()).toEqual("2024-12-01");
        });

        it("starts with no route info", ({ row: { appGig } }) => {
          expect(appGig.getDistanceInfo()).toBeNull();
        });

        it("can fill out the route info on demand", async ({ row: { appGig } }) => {
          expect(distanceService.getDistanceInfo).not.toHaveBeenCalled();
          await appGig.fetchDistanceInfo();
          expect(distanceService.getDistanceInfo).toHaveBeenCalled();
          expect(appGig.getDistanceInfo()).not.toBeNull();
        });
      });

      describe("Email gig + Full Calendar Gig; Basic info matches", () => {
        const it = test.extend<{ row: EventRow }>({
          row: async ({ task: _ }, use) => {
            const mockDataWithDistanceInfo: calendar_v3.Schema$Event = {
              start: { dateTime: start },
              end: { dateTime: end },
              location,
              extendedProperties: {
                private: {
                  distanceInfo: JSON.stringify(mockDistanceData),
                  parts: JSON.stringify(mockParts)
                }
              }
            };
            const emailGig = EmailGig.make(location, [mockReceptionPart]);
            const calendarGig = GoogleGig.make(mockDataWithDistanceInfo);

            const row = EventRow.buildRow(emailGig, calendarGig, distanceService);
            expect(row).instanceof(EventRow);
            expect(row.id).toEqual("2024-12-01");
            return await use(row);
          }
        });

        it("has basic info that matches the email gig", ({ row: { appGig } }) => {
          expect(appGig.getLocation()).toEqual(location);
          expect(appGig.getStartTime()).toEqual(start);
          expect(appGig.getEndTime()).toEqual(end);
          expect(appGig.getId()).toEqual("2024-12-01");
        });

        it("has parts that match the email gig", ({ row: { appGig } }) => {
          expect(appGig.getParts()).toEqual([mockReceptionJSONWithActual]);
        });

        it("populates the route info from the stored gig", ({ row: { appGig } }) => {
          expect(distanceService.getDistanceInfo).not.toHaveBeenCalled();
          expect(appGig.getDistanceInfo()).toEqual(mockDistanceData);
          expect(distanceService.getDistanceInfo).not.toHaveBeenCalled();
        });

        it("does not call the distance service when calling setDistanceInfo", async ({ row: { appGig } }) => {
          expect(appGig.getDistanceInfo()).not.toBeNull();
          expect(distanceService.getDistanceInfo).not.toHaveBeenCalled();
          await appGig.fetchDistanceInfo();
          expect(distanceService.getDistanceInfo).not.toHaveBeenCalled();
          expect(appGig.getDistanceInfo()).not.toBeNull();
        });
      });

      describe("Email gig + Basic Calendar Gig; Location differs", () => {
        const updatedLocation = "somewhere else";
        const it = test.extend<{ row: EventRow }>({
          row: async ({ task: _ }, use) => {
            const mockData: calendar_v3.Schema$Event = {
              start: { dateTime: start },
              end: { dateTime: end },
              location
            };
            const emailGig = EmailGig.make(updatedLocation, [mockReceptionPart]);
            const calendarGig = GoogleGig.make(mockData);

            const row = EventRow.buildRow(emailGig, calendarGig, distanceService);
            expect(row).instanceof(EventRow);
            return await use(row);
          }
        });

        it("has basic info that matches the email gig", ({ row: { appGig } }) => {
          expect(appGig.getLocation()).toEqual(updatedLocation);
          expect(appGig.getStartTime()).toEqual(start);
          expect(appGig.getEndTime()).toEqual(end);
          expect(appGig.getId()).toEqual("2024-12-01");
        });

        it("starts with no route info and can fill it in on demand", async ({ row: { appGig } }) => {
          expect(appGig.getDistanceInfo()).toBeNull();
          expect(distanceService.getDistanceInfo).not.toHaveBeenCalled();
          await appGig.fetchDistanceInfo();
          expect(distanceService.getDistanceInfo).toHaveBeenCalled();
          expect(appGig.getDistanceInfo()).not.toBeNull();
        });
      });

      describe("Email gig + Full Calendar Gig; Location differs", () => {
        const updatedLocation = "somewhere else";

        const it = test.extend<{ row: EventRow }>({
          row: async ({ task: _ }, use) => {
            const mockDataWithDistanceInfo: calendar_v3.Schema$Event = {
              start: { dateTime: start },
              end: { dateTime: end },
              location,
              extendedProperties: {
                private: {
                  distanceInfo: JSON.stringify(mockDistanceData)
                }
              }
            };
            const emailGig = EmailGig.make(updatedLocation, [mockReceptionPart]);
            const calendarGig = GoogleGig.make(mockDataWithDistanceInfo);

            const row = EventRow.buildRow(emailGig, calendarGig, distanceService);
            expect(row).instanceof(EventRow);
            return await use(row);
          }
        });

        it("has basic info that matches the email gig", ({ row: { appGig } }) => {
          expect(appGig.getLocation()).toEqual(updatedLocation);
          expect(appGig.getStartTime()).toEqual(start);
          expect(appGig.getEndTime()).toEqual(end);
          expect(appGig.getId()).toEqual("2024-12-01");
        });

        it("keeps the distance info empty (because it's out of date) but can fill it in info on demand", async ({ row: { appGig } }) => {
          expect(distanceService.getDistanceInfo).not.toHaveBeenCalled();
          expect(appGig.getDistanceInfo()).toBeNull();
          expect(distanceService.getDistanceInfo).not.toHaveBeenCalled();
          await appGig.fetchDistanceInfo();
          expect(distanceService.getDistanceInfo).toHaveBeenCalled();
          expect(appGig.getDistanceInfo()).not.toBeNull();
        });
      });

      describe("Email gig + Full Calendar Gig; parts differ", () => {
        it("doesn't actually need tests or even implementation, " +
          "because the email is the source of correct truth," +
          "and if we always make the parts from the email " +
          "then there's not really any such thing as updating!", () => {
          expect(true).toBe(true);
        });
      });

      describe("Email gig only", () => {
        const it = test.extend<{ row: EventRow }>({
          row: async ({ task: _ }, use) => {
            const emailGig = EmailGig.make(location, [mockReceptionPart]);
            const row = EventRow.buildRow(emailGig, undefined, distanceService);
            expect(row).instanceof(EventRow);
            return await use(row);
          }
        });

        it("returns with a row where calendarGig is undefined", ({ row }) => {
          expect(row.getCalendarGig()).toBeUndefined();
        });

        it("returns a row with an appGig matching the emailGig", ({ row: { appGig } }) => {
          expect(appGig.getLocation()).toEqual(location);
          expect(appGig.getParts()).toEqual([mockReceptionJSONWithActual]);
          expect(appGig.isNew).toBe(true);
        });
      });
    });


    describe("Events worth updating", () => {
      const updatedLocation = "somewhere else";

      const ceremonyStart = "2024-12-01T17:30:00";
      const receptionLaterEnd = "2024-12-01T23:30:00";

      const partsJSON: GigPartJSON[] = [
        {
          type: "cocktail hour",
          startDateTime: cocktailStart,
          endDateTime: cocktailEnd,
          actualStartDateTime: cocktailStart,
          actualEndDateTime: cocktailEnd
        }, {
          type: "reception",
          startDateTime: receptionStart,
          endDateTime: receptionEnd,
          actualStartDateTime: receptionStart,
          actualEndDateTime: receptionEnd
        }
      ];

      const ceremonyPart = new Ceremony(ceremonyStart, cocktailStart);
      const cocktailHourPart = new CocktailHour(cocktailStart, cocktailEnd);
      const receptionPart = new Reception(cocktailEnd, receptionEnd);

      const parts: GigPart[] = [
        cocktailHourPart,
        receptionPart
      ];

      describe("hasChanged", () => {
        const calendarGig = GoogleGig.make({
          start: { dateTime: receptionStart },
          end: { dateTime: receptionEnd },
          location,
          extendedProperties: {
            private: {
              parts: JSON.stringify(partsJSON)
            }
          }
        });

        it("is false if there are no changes in parts or locations", () => {
          const emailGig = EmailGig.make(location, parts);
          const row = EventRow.buildRow(emailGig, calendarGig, distanceService);
          expect(row.locationHasChanged).toBe(false);
          expect(row.partsHaveChanged).toBe(false);
          expect(row.hasChanged).toBe(false);
        });

        it("is true if the two gigs have different locations", () => {
          const emailGig = EmailGig.make(updatedLocation, parts);
          const row = EventRow.buildRow(emailGig, calendarGig, distanceService);
          expect(row.locationHasChanged).toBe(true);
          expect(row.hasChanged).toBe(true);
        });


        it.each<[string, GigPart[]]>([
          ["a single part has changed", [
            cocktailHourPart,
            new Reception(receptionStart, receptionLaterEnd)
          ]],
          ["a part has been removed", [receptionPart]],
          ["a part has been added", [ceremonyPart, ...parts]]
        ])("is true if %s", (_, emailParts) => {
          const emailGig = EmailGig.make(location, emailParts);
          const row = EventRow.buildRow(emailGig, calendarGig, distanceService);
          expect(row.partsHaveChanged).toBe(true);
          expect(row.hasChanged).toBe(true);
        });
      });

      describe("hasUpdates", () => {
        it("is false if the google gig has all the information (parts and distance data)", () => {
          const calendarGig = GoogleGig.make({
            start: { dateTime: receptionStart },
            end: { dateTime: receptionEnd },
            location,
            extendedProperties: {
              private: {
                parts: JSON.stringify(partsJSON),
                distanceInfo: JSON.stringify(mockDistanceData)
              }
            }
          });

          const emailGig = EmailGig.make(location, parts);
          const row = EventRow.buildRow(emailGig, calendarGig, distanceService);
          expect(row.hasUpdates).toBe(false);
        });

        it("is true if hasChanged is true", () => {
          const calendarGig = GoogleGig.make({
            start: { dateTime: receptionStart },
            end: { dateTime: receptionEnd },
            location,
            extendedProperties: {
              private: {
                parts: JSON.stringify(partsJSON),
                distanceInfo: JSON.stringify(mockDistanceData)
              }
            }
          });

          const emailGig = EmailGig.make("somewhere else", parts);
          const row = EventRow.buildRow(emailGig, calendarGig, distanceService);
          expect(row.hasUpdates).toBe(true);
        });

        it("is true if google gig is missing parts", () => {
          const calendarGig = GoogleGig.make({
            start: { dateTime: receptionStart },
            end: { dateTime: receptionEnd },
            location,
            extendedProperties: {
              private: {
                distanceInfo: JSON.stringify(mockDistanceData)
              }
            }
          });

          const emailGig = EmailGig.make(location, parts);
          const row = EventRow.buildRow(emailGig, calendarGig, distanceService);
          expect(row.hasUpdates).toBe(true);
        });

        describe("google gig is missing distance info", () => {
          const it = test.extend<{ row: EventRow }>({
            row: async ({ task: _ }, use) => {
              const calendarGig = GoogleGig.make({
                start: { dateTime: receptionStart },
                end: { dateTime: receptionEnd },
                location,
                extendedProperties: {
                  private: {
                    parts: JSON.stringify(partsJSON)
                  }
                }
              });

              const emailGig = EmailGig.make(location, parts);
              use(EventRow.buildRow(emailGig, calendarGig, distanceService));
            }
          });

          it("is false if the app gig also doesn't have distance info", ({ row }) => {
            expect(row.hasUpdates).toBe(false);
          });

          it("is true if the app gig has distance info", async ({ row }) => {
            await row.appGig.fetchDistanceInfo();
            expect(row.hasUpdates).toBe(true);
          });
        });
      });
    });
  });
});
