"use client";

import { useActionState } from "react";
import { useMemo } from "react";
import { sendDevotional } from "@/app/actions";
import type { DevotionalEmailDelivery, DevotionalEmailEvent } from "@/lib/database.types";
import type { FormState } from "@/lib/form-state";

const initialState: FormState = { message: "", success: false };

function statusLabel(status: DevotionalEmailDelivery["status"]) {
  switch (status) {
    case "queued":
      return "Queued";
    case "sending":
      return "Sending";
    case "sent":
      return "Accepted by Resend";
    case "delivered":
      return "Delivered";
    case "failed":
      return "Failed";
  }
}

export default function DevotionalDeliveryPanel({
  devotionalId,
  deliveries,
  events,
  readOnly = false,
}: {
  devotionalId: string;
  deliveries: DevotionalEmailDelivery[];
  events: DevotionalEmailEvent[];
  readOnly?: boolean;
}) {
  const [state, action, pending] = useActionState(sendDevotional, initialState);
  const acceptedCount = deliveries.filter(
    (delivery) => delivery.status === "sent" || delivery.status === "delivered",
  ).length;
  const deliveredCount = deliveries.filter((delivery) => delivery.status === "delivered").length;
  const failedCount = deliveries.filter((delivery) => delivery.status === "failed").length;
  const eventCounts = useMemo(() => {
    const counts = new Map<string, { opened: number; clicked: number }>();
    for (const event of events) {
      const current = counts.get(event.delivery_id) ?? { opened: 0, clicked: 0 };
      if (event.event_type === "opened") current.opened += 1;
      if (event.event_type === "clicked") current.clicked += 1;
      counts.set(event.delivery_id, current);
    }
    return counts;
  }, [events]);

  return (
    <div className="min-w-[220px] space-y-2">
      <form action={action}>
        <input type="hidden" name="devotional_id" value={devotionalId} />
        <button className="btn-secondary text-xs" disabled={pending || readOnly}>
          {pending ? "Sending..." : failedCount ? "Send / retry failed" : "Send devotional"}
        </button>
      </form>
      {deliveries.length > 0 && (
        <details className="text-xs text-[#59645e]">
          <summary className="cursor-pointer">
            {acceptedCount} accepted · {deliveredCount} delivered · {failedCount} failed
          </summary>
          <ul className="mt-2 space-y-2">
            {deliveries.map((delivery) => (
              <li key={delivery.id} className="border-t border-[#173b35]/10 pt-2">
                <p className="font-semibold">{delivery.recipient_email}</p>
                <p>{statusLabel(delivery.status)}</p>
                <p>
                  {eventCounts.get(delivery.id)?.opened ?? 0} opens ·{" "}
                  {eventCounts.get(delivery.id)?.clicked ?? 0} clicks
                </p>
                {delivery.error_message && (
                  <p className="mt-1 break-words text-red-700">{delivery.error_message}</p>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
      {state.message && (
        <p role={state.success ? "status" : "alert"} className="max-w-[360px] text-xs">
          {state.message}
        </p>
      )}
    </div>
  );
}
