
import { EventRowJson } from "@/lib/models/EventRow";
import { FullDistanceInfoObj } from "@/lib/models/FullCalendarGig";
import { DistanceInfo } from "@/app/events/components/DistanceInfo";
import { FullGigHeader } from "@/app/events/components/FullGigHeader";
import {
  GetDistanceInfoButtonWithFetcher,
  SaveGigButton,
  UpdateGigButton
} from "@/app/events/components/GigButtons";
import { GigPartUI } from "@/app/events/components/GigPartUI";
// import { EventsActionIntent } from "@/app/events/EventsActionIntent";
// import { useToggleParamValue } from "@/app/events/filters/useEventFilters";
// import { useEventRouteFetchers } from "@/app/events/useEventRouteFetchers";
import { useSearchParams } from "next/navigation";
import { GigActionButton } from "@/app/events/components/GigActionButton";
import { getDistanceInfo } from "@/app/events/functions/getDistanceInfo";


function addDistanceInfoToRow(row: EventRowJson, distanceInfo: FullDistanceInfoObj) {
  return { ...row, appGig: { ...row.appGig, distanceInfo } } satisfies EventRowJson;
}

// function useFetchedDistanceInfo(row: EventRowJson) {
//   const fetchers = useEventRouteFetchers();
//   const thisDistanceInfo = fetchers[EventsActionIntent.getDistanceInfo]
//     .find(f => f.data?.id === row.id);
//   return thisDistanceInfo?.data.distanceInfo;
// }

// function useAlwaysShown(row: EventRowJson) {
//   const toggleAlwaysShow = useToggleParamValue("alwaysShow");
//   const params = useSearchParams();
//   const alwaysShown = params.getAll("alwaysShow").includes(row.id);
//   return { toggleAlwaysShow, alwaysShown };
// }

export function FullGigUI(props: { row: EventRowJson }) {
  const gig = props.row.appGig;
  // const thisDistanceInfo = useFetchedDistanceInfo(props.row);
  // const row = addDistanceInfoToRow(props.row, thisDistanceInfo ?? gig.distanceInfo);
  const row = props.row
  // const { toggleAlwaysShow, alwaysShown } = useAlwaysShown(row);

  // hasUpdates is written in parsing.
  // when using fixtures, timeIsDifferent will calculate even if we forgot to mark the fixture.

  const timeIsDifferent = row.googleGig &&
    ((gig.startTime !== row.googleGig?.startDateTime)
      || (gig.endTime !== row.googleGig?.endDateTime));

  return (
    <div className="[&>*]:p-2">
      <FullGigHeader row={row} timeIsDifferent={timeIsDifferent} />

      <ul>
        {gig.parts.map(part => <GigPartUI key={part.type} part={part} />)}
      </ul>

      <div>
        {/*{thisDistanceInfo ?? gig.distanceInfo ? <DistanceInfo info={thisDistanceInfo ?? gig.distanceInfo} /> : null}*/}
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
          {!gig.distanceInfo ?
            <GigActionButton
              value={row.appGig}
              row={row}
              // intent={EventsActionIntent.getDistanceInfo}
              idleText={"Get distance info"}
              loadingText={"Getting distance info"}
              testId={"GET_DISTANCE_INFO_BUTTON"}
              action={getDistanceInfo}
            />




            : null}
        </div>
      </div>
    </div>
  );
}
