import { mock } from "vitest-mock-extended";

import EmailGig from "@/lib/models/EmailGig";
import GoogleGig from "@/lib/models/GoogleGig";
import Schedule from "@/lib/models/Schedule";
import { end, location, receptionPart, start } from "@/lib/models/tests/testConstants";
import DistanceService from "@/lib/services/DistanceService";

describe("Schedule", () => {
  describe("Schedule.build", () => {
    it("matches an email event with a google event", () => {
      const emailGig = EmailGig.make(location, [receptionPart]);
      const googleId = 'abcd';

      const remoteGig = GoogleGig.make({
        start: { dateTime: start },
        end: { dateTime: end },
        location,
        id: googleId
      });

      // sanity check
      expect(emailGig.getId()).toEqual(remoteGig.getId());

      const schedule = Schedule.build({
          emailGigs: [emailGig],
          remoteGigs: [remoteGig]
        },
        mock<DistanceService>()
      );

      expect(schedule.eventSets).toHaveLength(1)

      const [row] = schedule.eventSets
      expect(row.id).toEqual(emailGig.getId());
      expect(row.getCalendarGig()?.getGoogleId()).toEqual(googleId);
      expect(row.appGig?.getGoogleId()).toEqual(googleId);
    });

    it("handles a new email event (with no matching google event)", () => {
      const emailGig = EmailGig.make(location, [receptionPart]);

      const schedule = Schedule.build({
          emailGigs: [emailGig],
          remoteGigs: []
        },
        mock<DistanceService>()
      );

      const rows = schedule.eventSets

      expect(rows).toHaveLength(1)
      expect(rows[0].getCalendarGig()).toBeUndefined()
      expect(rows[0].appGig.serialize().googleId).toBeNull()
    });

    it.todo("orphaned calendar events (nowhere near urgent)");
  });
});
