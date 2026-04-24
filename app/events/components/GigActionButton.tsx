// import { useFetcher } from "@remix-run/react";

import { EventRowJson } from "@/lib/models/EventRow";
import { TextButton } from "@/app/events/components/TextButton";
import { PropsWithChildren } from "react";

// import { EventsActionIntent } from "@/app/events/EventsActionIntent";

export function GigActionButton({
  row, intent, idleText, testId, loadingText, value, action, loading
}: {
  row: EventRowJson
  // intent: (typeof EventsActionIntent)[keyof typeof EventsActionIntent]
  intent?: string
  idleText: string
  loadingText: string
  testId?: string,
  value: object
  action?: (f: FormData) => void
  loading?: boolean
}) {
  // const { Form, state } = useFetcher();

  return (
    <form method="post" id={row.id} action={action}>
      <input type="hidden" name="gig" value={JSON.stringify(value)}/>
      <TextButton
        name="intent"
        value={intent}
        {...testId && { "data-testid": testId }}
      >
        {!loading ? idleText : `${loadingText}...`}
      </TextButton>
    </form>
  );
}


export function GigServerActionButton({ row, action, testId, children }: PropsWithChildren<{
  row: EventRowJson,
  action?: (f: FormData) => void
  testId?: string,
}>) {
  return (
    <form method="post" id={row.id} action={action}>
      <input type="hidden" name="gig" value={JSON.stringify(row.appGig)}/>
      <TextButton {...testId && { "data-testid": testId }}      >
        {children}
      </TextButton>
    </form>
  );
}
