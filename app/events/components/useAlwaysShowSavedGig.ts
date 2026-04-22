// app/routes/events/components/useSaveGig.ts
import { useSearchParams } from "@remix-run/react";
import { useEffect } from "react";

import { EventsActionIntent } from "@/app/events/EventsActionIntent";
import { useToggleParamValue } from "@/app/events/filters/useEventFilters";
import { useEventRouteFetchers } from "@/app/events/useEventRouteFetchers";

export function useAlwaysShowSavedGig(rowId: string) {
  const fetchers = useEventRouteFetchers();
  const createEventFetcher = fetchers[EventsActionIntent.createEvent].find(
    (fetcher) => fetcher.data?.id === rowId
  );
  const toggleAlwaysShow = useToggleParamValue("alwaysShow");
  const [params] = useSearchParams();
  const alwaysShown = params.getAll("alwaysShow").includes(rowId);

  useEffect(() => {
    if (
      createEventFetcher?.data?.intent === EventsActionIntent.createEvent &&
      createEventFetcher.state === "idle" &&
      !alwaysShown
    ) {
      toggleAlwaysShow(rowId);
    }
  }, [createEventFetcher?.data?.intent, createEventFetcher?.state, rowId, toggleAlwaysShow, alwaysShown]);
}
