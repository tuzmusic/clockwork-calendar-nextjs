"use client"

import React, { ComponentProps, useActionState, useState } from "react";

import { EventRowJson } from "@/lib/models/EventRow";
import { CalendarGigUI } from "@/app/events/components/CalendarGigUI";
import { EmailHtml } from "@/app/events/components/EmailHtml";
import { FullGigUI } from "@/app/events/components/FullGigUI";
import { RoundedWrapper } from "@/app/events/components/RoundedWrapper";
import { GigServerActionButton } from "@/app/events/components/GigServerActionButton";
import { saveNewGig } from "@/app/events/functions/calendarActions";

const MobileWrapper = (props: ComponentProps<typeof RoundedWrapper>) =>
  <RoundedWrapper className={`hidden sm:flex ${props.className ?? ""}`}>
    {props.children}
  </RoundedWrapper>;


const tabNames = ["Email", "Full", "Calendar"] satisfies Array<keyof typeof TABS>;

function EmailGigCell({ row }: { row: EventRowJson }) {
  return row.emailGig ? <EmailHtml gig={row.emailGig} /> : null;
}

function CalendarGigCell({ row }: { row: EventRowJson }) {
  const [_, saveGigAction, saveGigLoading] = useActionState(saveNewGig, null)


  return row.googleGig
    ? <CalendarGigUI row={row} hasUpdates={row.hasUpdates} />
    : (
      // we need these styles here for mobile,
      // which doesn't have the MobileWrapper styles below
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

export function EventRowUI({ row }: { row: EventRowJson }) {
  // useAlwaysShowSavedGig(row.id)

  const [selectedTab, setSelectedTab] = useState<keyof typeof TABS>("Full");

  return <React.Fragment key={row.id}>
    <MobileWrapper className={"bg-amber-500 sm:bg-amber-200"}>
      <EmailGigCell row={row} />
    </MobileWrapper>

    <div id="MiddleComponent-and-Tabs">
      <RoundedWrapper>
        <div className="hidden sm:block">
          <FullGigUI row={row} />
        </div>
        {/* All tabs share the same grid cell so container height = max of all tabs */}
        <div className="sm:hidden grid grid-cols-1 grid-rows-1">
          <div className={`col-start-1 row-start-1 ${selectedTab === "Email" ? "" : "invisible pointer-events-none"}`}>
            <EmailGigCell row={row} />
          </div>
          <div className={`col-start-1 row-start-1 ${selectedTab === "Full" ? "" : "invisible pointer-events-none"}`}>
            <FullGigUI row={row} />
          </div>
          <div className={`col-start-1 row-start-1 ${selectedTab === "Calendar" ? "" : "invisible pointer-events-none"}`}>
            <CalendarGigCell row={row} />
          </div>
        </div>
      </RoundedWrapper>

      <div className="w-fit overflow-hidden ml-4 border-0 rounded-b-lg border-black border-t-0 sm:hidden">
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

    <MobileWrapper
      className={"bg-blue-600 sm:bg-blue-200 w-full "
        + `${row.googleGig ? "justify-end" : "justify-center items-center"}`}
    >
      <CalendarGigCell row={row} />
    </MobileWrapper>
  </React.Fragment>;
}

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
