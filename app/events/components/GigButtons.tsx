import { EventRowJson } from "@/lib/models/EventRow";
import { GigActionButton } from "@/app/events/components/GigActionButton";
// import { EventsActionIntent } from "@/app/events/EventsActionIntent";

export const SaveGigButton = ({ row }: { row: EventRowJson }) =>
  <GigActionButton
    value={row.appGig}
    row={row}
    // intent={EventsActionIntent.createEvent}
    idleText={"Save"}
    loadingText={"Saving"}
    testId={"SAVE_BUTTON"}
  />;


export const UpdateGigButton = ({ row }: { row: EventRowJson }) =>
  <GigActionButton
    value={row.appGig}
    row={row}
    // intent={EventsActionIntent.updateEvent}
    idleText={"Update"}
    loadingText={"Updating"}
    testId={"UPDATE_BUTTON"}
  />;


export const GetDistanceInfoButtonWithFetcher = ({ row }: { row: EventRowJson }) =>
  <GigActionButton
    value={row.appGig}
    row={row}
    // intent={EventsActionIntent.getDistanceInfo}
    idleText={"Get distance info"}
    loadingText={"Getting distance info"}
    testId={"GET_DISTANCE_INFO_BUTTON"}
  />;

