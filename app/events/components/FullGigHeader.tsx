import dayjs from "dayjs";

import DayJsTz from "@/lib/models/DayJsTz";
import { EventRowJson } from "@/lib/models/EventRow";

export function FullGigHeader({ row, ...props }: {
  row: EventRowJson
  timeIsDifferent: null | boolean,
}) {
  const gig = row.appGig;
  const date = dayjs(gig.parts[0].startDateTime).format("MMMM D, YYYY");
  const [startTime, endTime] = [gig.startTime, gig.endTime].map(t => DayJsTz(t).format("h:mma"));

  const [venue, ...locationParts] = gig.location.split(",");
  const location = locationParts.join();

  return <h3 className="flex justify-between border-b-2 align-middle">
    <div className="font-bold">
      <div>
        <span>{date}</span>
        {!row.googleGig ? <span className={"text-green-500"}>{" "}NEW</span> : null}
      </div>
      <div className={props.timeIsDifferent ? "text-red-700" : ""}>{startTime}-{endTime}</div>
    </div>
    <div className="text-right">
      <div>{venue}</div>
      <div>{location}</div>
    </div>
  </h3>;
}
