import { EventRowJson } from "@/lib/models/EventRow";
import { TextButton } from "@/app/events/components/TextButton";
import { PropsWithChildren } from "react";

export function GigServerActionButton({ row, action, testId, children }: PropsWithChildren<{
  row: EventRowJson,
  action?: (f: FormData) => void
  testId?: string,
}>) {
  return (
    <form id={row.id} action={action}>
      <input type="hidden" name="gig" value={JSON.stringify(row.appGig)}/>
      <TextButton {...testId && { "data-testid": testId }}      >
        {children}
      </TextButton>
    </form>
  );
}
