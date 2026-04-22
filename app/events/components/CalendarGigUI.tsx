import DayJsTz from "@/lib/models/DayJsTz";
import { EventRowJson } from "@/lib/models/EventRow";

export function CalendarGigUI({ row }: { row: EventRowJson, hasUpdates: boolean }) {
  const gig = row.googleGig;
  if (!gig) return null;

  const [start, end] = [gig.startDateTime, gig.endDateTime].map(
    d => DayJsTz(d).format("h:mma")
  );

  const date = <>{DayJsTz(gig.id).format("M/D/YY")}</>;

  const displayTitle = gig.title.replace("Clockwork Gig", "");
  return (
    <div className="p-2 h-full flex flex-col">
      <ul className="text-right">
        <li className="flex gap-4 justify-end">
          <span className="font-bold">{date}</span>
          {displayTitle ? <span>{displayTitle}</span> : null}
        </li>
        <li>{gig.location}</li>
        <li>{start}-{end}</li>
      </ul>
    </div>
  );
}
