import { GigPart } from "@/lib/models/GigParts/GigPart";
import EmailParser from "@/lib/parsers/emailParser/EmailParser";

import { buildEvent, buildHtml, buildMonthHeader, buildOtherPart } from "./htmlBuilders";

const location = "Lenox Hotel, Boston, MA";

function assertEqualsIgnoringWhitespace(str1: string | null, str2: string | null) {
  expect(str1).not.toBeNull()
  expect(str2).not.toBeNull()
  expect(str1?.replace(/\s+/g, ``)).toEqual(str2?.replace(/\s+/g, ``));
}

expect.extend({
  toEqualIgnoringWhitespace(got: string, want: string) {
    return {
      pass: got.trim().replace(/\s+/g, ``) === want.trim().replace(/\s+/g, ``),
      message: () => `Even with whitespace removed, ${got} does not equal ${want}.`
    };
  }
});

describe("Parsing event parts", () => {
  describe("Reception", () => {
    it("Parses an event with reception only", () => {
      const eventHtml = buildEvent({
        dateNum: 8,
        timeStr: "6:00-10:30",
        location
      });

      const html = buildHtml(
        buildMonthHeader("July, 2024"),
        eventHtml
      );
      const gigs = EmailParser.parseEmail(html);
      const event = gigs.shift()!;

      expect(event.getParts()).toHaveLength(1);
      const [reception] = event.getParts();
      testEventPart(
        reception,
        "reception",
        "2024-07-08T18:00:00",
        "2024-07-08T22:30:00"
      );

      assertEqualsIgnoringWhitespace(
        event.getOriginalHtml(),
        eventHtml
      );
    });

    it("Parses an event with reception ending after 12am (but before 1am)", () => {
      const html = buildHtml(
        buildMonthHeader("July, 2024"),
        buildEvent({
          dateNum: 8,
          timeStr: "6:00-12:30",
          location
        })
      );
      const event = EmailParser.parseEmail(html).shift()!;

      expect(event.getParts()).toHaveLength(1);
      const [reception] = event.getParts();
      testEventPart(
        reception,
        "reception",
        "2024-07-08T18:00:00",
        "2024-07-09T00:30:00"
      );
      expect(event.getId()).toEqual("2024-07-08");
    });

    it("Parses an event with reception ending AT 12am", () => {
      const html = buildHtml(
        buildMonthHeader("July, 2024"),
        buildEvent({
          dateNum: 8,
          timeStr: "6:00-12:00",
          location
        })
      );
      const event = EmailParser.parseEmail(html).shift()!;

      expect(event.getParts()).toHaveLength(1);
      const [reception] = event.getParts();
      testEventPart(
        reception,
        "reception",
        "2024-07-08T18:00:00",
        "2024-07-09T00:00:00"
      );
    });
  });

  describe("Cocktail hour and ceremony", () => {
    it("Parses an event with a reception and cocktail hour", () => {
      const receptionStr = buildEvent({
        dateNum: 8,
        timeStr: "6:00-10:30",
        location
      });
      const cocktailStr = buildOtherPart({ timeStr: "5:00-6:00", part: "Cocktail Hour" });

      const html = buildHtml(
        buildMonthHeader("July, 2024"),
        receptionStr,
        cocktailStr
      );

      const event = EmailParser.parseEmail(html).shift()!;

      const eventHtml = `${receptionStr}${cocktailStr}`;
      assertEqualsIgnoringWhitespace(
        event.getOriginalHtml(),
        eventHtml
      );

      expect(event.getParts()).toHaveLength(2);
      const [cocktails, reception] = event.getParts(); // implicitly tests ordering
      testEventPart(
        reception,
        "reception",
        "2024-07-08T18:00:00",
        "2024-07-08T22:30:00"
      );

      testEventPart(
        cocktails,
        "cocktail hour",
        "2024-07-08T17:00:00",
        "2024-07-08T18:00:00"
      );
    });

    it("Parses an event with a reception, ceremony and cocktail hour", () => {
      const html = buildHtml(
        buildMonthHeader("July, 2024"),
        buildEvent({
          dateNum: 8,
          timeStr: "6:00-10:30",
          location
        }),
        buildOtherPart({ timeStr: "4:30-5:00", part: "Ceremony" }),
        buildOtherPart({ timeStr: "5:00-6:00", part: "Cocktail Hour" })
      );

      const event = EmailParser.parseEmail(html).shift()!;

      expect(event.getParts()).toHaveLength(3);
      const [ceremony, cocktails, reception] = event.getParts();
      testEventPart(
        reception,
        "reception",
        "2024-07-08T18:00:00",
        "2024-07-08T22:30:00"
      );

      testEventPart(
        cocktails,
        "cocktail hour",
        "2024-07-08T17:00:00",
        "2024-07-08T18:00:00"
      );

      testEventPart(
        ceremony,
        "ceremony",
        "2024-07-08T16:30:00", // schedule says ceremony starts at 4:30
        "2024-07-08T17:00:00"
      );

      expect(ceremony.actualStartDateTime).toEqual(
        "2024-07-08T16:00:00" // but we start playing at 4:00
      );
    });
  });
});

function testEventPart(
  part: GigPart,
  type: string,
  startTime: string,
  endTime: string
) {
  expect(part.type).toEqual(type);
  expect(part.startDateTime).toEqual(startTime);
  expect(part.endDateTime).toEqual(endTime);
}
