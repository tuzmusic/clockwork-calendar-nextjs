"use client"

import { memo, useActionState, useEffect, useState } from "react";

import { EventRowJson } from "@/lib/models/EventRow";
import { CalendarGigUI } from "@/app/events/components/CalendarGigUI";
import { EmailHtml } from "@/app/events/components/EmailHtml";
import { FullGigUI } from "@/app/events/components/FullGigUI";
import { RoundedWrapper } from "@/app/events/components/RoundedWrapper";
import { GigServerActionButton } from "@/app/events/components/GigServerActionButton";
import { saveNewGig } from "@/app/events/functions/calendarActions";

const tabNames = ["Email", "Full", "Calendar"] satisfies Array<keyof typeof TABS>;

function EmailGigCell({ row }: { row: EventRowJson }) {
  return row.emailGig ? <EmailHtml gig={row.emailGig} /> : null;
}

function CalendarGigCell({ row, onGigSaved }: { row: EventRowJson, onGigSaved: (id: string) => void }) {
  const [saveResult, saveGigAction, saveGigLoading] = useActionState(saveNewGig, null)

  useEffect(() => {
    if (saveResult?.success) onGigSaved(row.id);
  }, [saveResult]);

  return row.googleGig
    ? <CalendarGigUI row={row} />
    : (
      // flex styles needed here since the outer cell isn't flex on mobile
      <div className={"flex h-full justify-center items-center"}>
        <GigServerActionButton
          row={row}
          action={saveGigAction}
          testId={"SAVE_BUTTON"}
        >
          {saveGigLoading ? "Saving..." : "Save"}
        </GigServerActionButton>
      </div>
    );
}

const TABS = {
  Email: EmailGigCell,
  Full: FullGigUI,
  Calendar: CalendarGigCell
} as const;

function mobileHide(selectedTab: keyof typeof TABS, tab: keyof typeof TABS) {
  return selectedTab !== tab
    ? "invisible pointer-events-none sm:visible sm:pointer-events-auto"
    : "";
}

export const EventRowUI = memo(function EventRowUI({ row, isSavedThisSession, onGigSaved }: {
  row: EventRowJson
  isSavedThisSession: boolean
  onGigSaved: (id: string) => void
}) {
  const [selectedTab, setSelectedTab] = useState<keyof typeof TABS>("Full");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 items-start">
      <RoundedWrapper className={`col-start-1 row-start-1 sm:col-auto sm:row-auto sm:flex ${mobileHide(selectedTab, "Email")}`}>
        <EmailGigCell row={row} />
      </RoundedWrapper>

      <RoundedWrapper className={`col-start-1 row-start-1 sm:col-auto sm:row-auto ${mobileHide(selectedTab, "Full")}`}>
        <FullGigUI row={row} isSavedThisSession={isSavedThisSession} onGigSaved={onGigSaved} />
      </RoundedWrapper>

      <RoundedWrapper className={`col-start-1 row-start-1 sm:col-auto sm:row-auto sm:flex w-full ${row.googleGig ? "sm:justify-end" : "sm:justify-center sm:items-center"} ${mobileHide(selectedTab, "Calendar")}`}>
        <CalendarGigCell row={row} onGigSaved={onGigSaved} />
      </RoundedWrapper>

      <div className="col-start-1 row-start-2 w-fit overflow-hidden ml-4 rounded-b-lg border-black border-t-0 sm:hidden">
        {tabNames.map(name => (
          <Tab
            name={name}
            selected={selectedTab === name}
            key={name}
            onSelect={() => setSelectedTab(name)}
          />
        ))}
      </div>
    </div>
  );
})

function Tab(props: { name: string, selected: boolean, onSelect: (name: string) => void }) {
  return <button type="button"
                 onClick={() => props.onSelect(props.name)}
                 className={`${props.selected
                   ? "bg-gray-300 border border-black overflow-clip border-t-0"
                   : "bg-gray-100"}
                   p-2 px-4 mx-0.5 rounded-b-lg`}
  >
    {props.name}
  </button>;
}
