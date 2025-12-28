import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";

import EmailParser from "@/lib/parsers/emailParser/EmailParser";
import { buildEvent, buildHtml, buildMonthHeader } from "@/lib/parsers/emailParser/tests/htmlBuilders";

dayjs.extend(timezone)

const location1 = 'Lenox Hotel, Boston, MA'
const location2 = 'Somewhere Else, Boston MA'

describe('ScheduleParser: Basic event/month parsing', () => {
  it('parses a single event in a single month', () => {
    const html = buildHtml(
      buildMonthHeader('July'),
      buildEvent({
        dateNum: 8,
        timeStr: '6:00-10:30',
        location: location1,
      })
    )
    const result = EmailParser.parseEmail(html)
    expect(result).toHaveLength(1)
  })

  it('parses a multiple events in a single month', () => {
    const html = buildHtml(
      buildMonthHeader('July'),
      buildEvent({ dateNum: 8, location: location1 }),
      buildEvent({ dateNum: 9, location: location2 })
    )
    const result = EmailParser.parseEmail(html)
    expect(result).toHaveLength(2)

     const startTimes = result.map((ev) => dayjs(ev.getStartTime()))

    // assert month
    expect(startTimes[0]!.month()).toEqual(6)
    expect(startTimes[1]!.month()).toEqual(6)

    // assert different, correct dates
    expect(startTimes[0]!.date()).toEqual(8)
    expect(startTimes[1]!.date()).toEqual(9)

    // assert different, correct locations
    expect(result[0]!.getLocation()).toEqual(location1)
    expect(result[1]!.getLocation()).toEqual(location2)
  })

  it('parses a multiple events in a multiple months', () => {
    const html = buildHtml(
      buildMonthHeader('July'),
      buildEvent({ dateNum: 8 }),
      buildEvent({ dateNum: 9 }),
      buildMonthHeader('August'),
      buildEvent({ dateNum: 18 }),
      buildEvent({ dateNum: 19 })
    )

    const result = EmailParser.parseEmail(html)
    expect(result).toHaveLength(4)

    const startTimes = result.map((ev) => dayjs(ev.getStartTime()))
    expect(startTimes.filter(Boolean)).toHaveLength(4)

    // assert month
    expect(startTimes[0]!.month()).toEqual(6)
    expect(startTimes[1]!.month()).toEqual(6)
    expect(startTimes[2]!.month()).toEqual(7)
    expect(startTimes[3]!.month()).toEqual(7)

    // assert different, correct dates
    expect(startTimes[0]!.date()).toEqual(8)
    expect(startTimes[1]!.date()).toEqual(9)
    expect(startTimes[2]!.date()).toEqual(18)
    expect(startTimes[3]!.date()).toEqual(19)
  })
})
