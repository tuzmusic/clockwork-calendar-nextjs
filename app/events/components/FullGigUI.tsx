import { EventRowJson } from "@/lib/models/EventRow";
import { DistanceInfo } from "@/app/events/components/DistanceInfo";
import { FullGigHeader } from "@/app/events/components/FullGigHeader";
import { SaveGigButton, UpdateGigButton } from "@/app/events/components/GigButtons";
import { GigPartUI } from "@/app/events/components/GigPartUI";
// import { EventsActionIntent } from "@/app/events/EventsActionIntent";
// import { useToggleParamValue } from "@/app/events/filters/useEventFilters";
// import { useEventRouteFetchers } from "@/app/events/useEventRouteFetchers";
import { GigActionButton } from "@/app/events/components/GigActionButton";
import { getDistanceInfo } from "@/app/events/functions/getDistanceInfo";
import { useActionState } from "react";


// function useAlwaysShown(row: EventRowJson) {
//   const toggleAlwaysShow = useToggleParamValue("alwaysShow");
//   const params = useSearchParams();
//   const alwaysShown = params.getAll("alwaysShow").includes(row.id);
//   return { toggleAlwaysShow, alwaysShown };
// }

export function FullGigUI(props: { row: EventRowJson }) {
  const gig = props.row.appGig;
  const row = props.row
  // const { toggleAlwaysShow, alwaysShown } = useAlwaysShown(row);

  // hasUpdates is written in parsing.
  // when using fixtures, timeIsDifferent will calculate even if we forgot to mark the fixture.

  const timeIsDifferent = row.googleGig &&
    ((gig.startTime !== row.googleGig?.startDateTime)
      || (gig.endTime !== row.googleGig?.endDateTime));

  const [fetchedDistanceInfo, distanceInfoAction , distanceInfoLoading] = useActionState(getDistanceInfo, null)
  const finalDistanceInfo = fetchedDistanceInfo?.distanceInfo ?? gig.distanceInfo
  return (
    <div className="[&>*]:p-2">
      <FullGigHeader row={row} timeIsDifferent={timeIsDifferent} />

      <ul>
        {gig.parts.map(part => <GigPartUI key={part.type} part={part} />)}
      </ul>

      <div>
        {finalDistanceInfo ? <DistanceInfo info={finalDistanceInfo} /> : null}
      </div>

      <div className={"flex justify-between"}>
        {/*<div>
          <label className="flex gap-1">
            <input
              type="checkbox"
              checked={alwaysShown}
              onChange={() => toggleAlwaysShow(row.id)}
            />
            <span>Always Shown</span>
          </label>
        </div>*/}

        <div className={"flex flex-col items-end"}>
          {!row.googleGig ? <SaveGigButton row={row} /> : null}
          {timeIsDifferent || row.hasUpdates ? <UpdateGigButton row={row} /> : null}

          {!finalDistanceInfo ?
            <GigActionButton
              value={row.appGig}
              row={row}
              idleText={"Get distance info"}
              loadingText={"Getting distance info"}
              testId={"GET_DISTANCE_INFO_BUTTON"}
              loading={distanceInfoLoading}
              action={distanceInfoAction}
            />
            : null}
        </div>
      </div>
    </div>
  );
}
