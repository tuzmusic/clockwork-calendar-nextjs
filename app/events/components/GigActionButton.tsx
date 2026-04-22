import { useFetcher } from "@remix-run/react";

import { EventRowJson } from "@/lib/models/EventRow";
import { TextButton } from "@/app/events/components/TextButton";
import { EventsActionIntent } from "@/app/events/EventsActionIntent";

export function GigActionButton({
  row, intent, idleText, testId, loadingText, value
}: {
  row: EventRowJson
  intent: (typeof EventsActionIntent)[keyof typeof EventsActionIntent]
  idleText: string
  loadingText: string
  testId?: string,
  value: object
}) {
  const { Form, state } = useFetcher();

  return (
    <Form method="post" id={row.id} >
      <input type="hidden" name="gig" value={JSON.stringify(value)} />
      <TextButton
        name="intent"
        value={intent}
        {...testId && { "data-testid": testId }}
      >
        {state === "idle" ? idleText : `${loadingText}...`}
      </TextButton>
    </Form>
  );
}

