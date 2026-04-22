import React, { ComponentProps, useState } from "react";

import { EventRowJson } from "@/lib/models/EventRow";
import { CalendarGigUI } from "@/app/events/components/CalendarGigUI";
import { EmailHtml } from "@/app/events/components/EmailHtml";
import { FullGigUI } from "@/app/events/components/FullGigUI";
import { SaveGigButton } from "@/app/events/components/GigButtons";
import { RoundedWrapper } from "@/app/events/components/RoundedWrapper";
import { useAlwaysShowSavedGig } from "@/app/events/components/useAlwaysShowSavedGig";

const MobileWrapper = (props: ComponentProps<typeof RoundedWrapper>) =>
  <RoundedWrapper className={`hidden sm:flex ${props.className ?? ""}`}>
    {props.children}
  </RoundedWrapper>;


const tabNames = ["Email", "Full", "Calendar"] satisfies Array<keyof typeof TABS>;

function EmailGigCell({ row }: { row: EventRowJson }) {
  return row.emailGig ? <EmailHtml gig={row.emailGig} /> : null;
}

function CalendarGigCell({ row }: { row: EventRowJson }) {
  return row.googleGig
    ? <CalendarGigUI row={row} hasUpdates={row.hasUpdates} />
    : (
      // we need these styles here for mobile,
      // which doesn't have the MobileWrapper styles below
      <div className={"flex h-full justify-center items-center"}>
        <SaveGigButton row={row} />
      </div>
    );
}

const TABS = {
  Email: EmailGigCell,
  Full: FullGigUI,
  Calendar: CalendarGigCell
} as const;

export function EventRowUI({ row }: { row: EventRowJson }) {
  useAlwaysShowSavedGig(row.id)

  const [selectedTab, setSelectedTab] = useState<keyof typeof TABS>("Full");
  const MiddleComponent = TABS[selectedTab];

  return <React.Fragment key={row.id}>
    <MobileWrapper className={"bg-amber-500 sm:bg-amber-200"}>
      <EmailGigCell row={row} />
    </MobileWrapper>

    <div id="MiddleComponent-and-Tabs">
      <RoundedWrapper className="relative">
        {
          // The sm:visible/hidden stuff here means that desktop will
          // always only show the FullGig in the middle even if a different
          // tab was selected when the screen was smaller.
          // This does mean, however, that the other tab will still
          // be selected when the screen gets smaller again.
        }
        <div className="invisible sm:visible">
          <FullGigUI row={row} />
        </div>
        <div className="w-full h-full absolute top-0 left-0 sm:hidden">
          <MiddleComponent row={row} />
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
