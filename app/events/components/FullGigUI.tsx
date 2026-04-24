import { EventRowJson } from "@/lib/models/EventRow";
import { DistanceInfo } from "@/app/events/components/DistanceInfo";
import { FullGigHeader } from "@/app/events/components/FullGigHeader";
import { SaveGigButton } from "@/app/events/components/GigButtons";
import { GigPartUI } from "@/app/events/components/GigPartUI";
// import { EventsActionIntent } from "@/app/events/EventsActionIntent";
// import { useToggleParamValue } from "@/app/events/filters/useEventFilters";
// import { useEventRouteFetchers } from "@/app/events/useEventRouteFetchers";
import { GigServerActionButton } from "@/app/events/components/GigActionButton";
import { getDistanceInfo } from "@/app/events/functions/getDistanceInfo";
import { useActionState } from "react";
import { updateGig } from "@/app/events/functions/calendarActions";
import { FullDistanceInfoObj } from "@/lib/models/FullCalendarGig";


// function useAlwaysShown(row: EventRowJson) {
//   const toggleAlwaysShow = useToggleParamValue("alwaysShow");
//   const params = useSearchParams();
//   const alwaysShown = params.getAll("alwaysShow").includes(row.id);
//   return { toggleAlwaysShow, alwaysShown };
// }
function addDistanceInfoToRow(row: EventRowJson, distanceInfo: FullDistanceInfoObj) {
  return { ...row, appGig: { ...row.appGig, distanceInfo } } satisfies EventRowJson;
}

export function FullGigUI(props: { row: EventRowJson }) {
  const gig = props.row.appGig;
  const row = props.row
  // const { toggleAlwaysShow, alwaysShown } = useAlwaysShown(row);

  // hasUpdates is written in parsing.
  // when using fixtures, timeIsDifferent will calculate even if we forgot to mark the fixture.

  const timeIsDifferent = row.googleGig &&
    ((gig.startTime !== row.googleGig?.startDateTime)
      || (gig.endTime !== row.googleGig?.endDateTime));

  const [fetchedDistanceInfo, distanceInfoAction, distanceInfoLoading] = useActionState(getDistanceInfo, null)
  const [_, updateGigAction, updateGigLoading] = useActionState(updateGig, null)

  const finalDistanceInfo = fetchedDistanceInfo?.distanceInfo ?? gig.distanceInfo
  const updatedRow = !finalDistanceInfo ? row : addDistanceInfoToRow(row, finalDistanceInfo)

  return (
    <div className="*:p-2">
      <FullGigHeader row={row} timeIsDifferent={timeIsDifferent}/>

      <ul>
        {gig.parts.map(part => <GigPartUI key={part.type} part={part}/>)}
      </ul>

      <div>
        {finalDistanceInfo ? <DistanceInfo info={finalDistanceInfo}/> : null}
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

        <div className={"flex flex-col items-end w-full"}>
          {!row.googleGig ? <SaveGigButton row={row}/> : null}
          {timeIsDifferent || row.hasUpdates ?
            <GigServerActionButton
              row={updatedRow}
              action={updateGigAction}
              testId={"UPDATE_BUTTON"}
            >
              {updateGigLoading ? "Updating..." : "Update"}
            </GigServerActionButton>
            : null}

          {!finalDistanceInfo ?
            <GigServerActionButton
              row={row}
              action={distanceInfoAction}
              testId={"GET_DISTANCE_INFO_BUTTON"}
            >
              {distanceInfoLoading ? "Getting distance info..." : "Get distance info"}
            </GigServerActionButton>
            : null}
        </div>
      </div>
    </div>
  );
}
