import { EventRowJson } from "@/lib/models/EventRow";
import { DistanceInfo } from "@/app/events/components/DistanceInfo";
import { FullGigHeader } from "@/app/events/components/FullGigHeader";
import { GigPartUI } from "@/app/events/components/GigPartUI";
import { GigServerActionButton } from "@/app/events/components/GigServerActionButton";
import { getDistanceInfo } from "@/app/events/functions/getDistanceInfo";
import { useActionState } from "react";
import { saveNewGig, updateGig } from "@/app/events/functions/calendarActions";
import { FullDistanceInfoObj } from "@/lib/models/FullCalendarGig";


function addDistanceInfoToRow(row: EventRowJson, distanceInfo: FullDistanceInfoObj) {
  return { ...row, appGig: { ...row.appGig, distanceInfo } } satisfies EventRowJson;
}

export function FullGigUI(props: { row: EventRowJson }) {
  const gig = props.row.appGig;
  const row = props.row

  const [fetchedDistanceInfo, distanceInfoAction, distanceInfoLoading] = useActionState(getDistanceInfo, null)
  const [_u, updateGigAction, updateGigLoading] = useActionState(updateGig, null)
  const [_s, saveGigAction, saveGigLoading] = useActionState(saveNewGig, null)

  const finalDistanceInfo = fetchedDistanceInfo?.distanceInfo ?? gig.distanceInfo
  const updatedRow = !finalDistanceInfo ? row : addDistanceInfoToRow(row, finalDistanceInfo)

  return (
    <div className="*:p-2">
      <FullGigHeader row={row}/>

      <ul>
        {gig.parts.map(part => <GigPartUI key={part.type} part={part}/>)}
      </ul>

      <div>
        {finalDistanceInfo ? <DistanceInfo info={finalDistanceInfo}/> : null}
      </div>

      <div className={"flex justify-between"}>
        <div className={"flex flex-col items-end w-full"}>
          {!row.googleGig ? <GigServerActionButton
            row={updatedRow}
            action={saveGigAction}
            testId={"SAVE_BUTTON"}
          >
            {saveGigLoading ? "Saving..." : "Save"}
          </GigServerActionButton> : null}
          {row.hasUpdates ?
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
