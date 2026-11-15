import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/utils/supabase/service";

export async function POST(request: Request) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Resend webhook is not configured." }, { status: 503 });
  }

  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  if (!id || !timestamp || !signature) {
    return NextResponse.json({ error: "Missing webhook signature headers." }, { status: 400 });
  }

  const payload = await request.text();
  let event;
  try {
    event = new Resend().webhooks.verify({
      payload,
      headers: { id, timestamp, signature },
      webhookSecret,
    });
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const tags = "tags" in event.data ? event.data.tags : undefined;
  const deliveryId = tags?.delivery_id;
  const isOurEmail = tags?.app === "daily_devotional";

  if (event.type === "email.opened" || event.type === "email.clicked") {
    if (!deliveryId || !isOurEmail) {
      return NextResponse.json({ received: true });
    }

    const { error } = await supabase.from("devotional_email_events").upsert(
      {
        provider_event_id: id,
        delivery_id: deliveryId,
        event_type: event.type === "email.opened" ? "opened" : "clicked",
        clicked_url: event.type === "email.clicked" ? event.data.click.link : null,
        occurred_at: event.created_at,
      },
      { onConflict: "provider_event_id", ignoreDuplicates: true },
    );
    if (error) {
      console.error("Could not save Resend engagement event:", error.message);
      return NextResponse.json({ error: "Could not save engagement event." }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  }

  let status: "delivered" | "failed" | null = null;
  let errorMessage: string | null = null;
  switch (event.type) {
    case "email.delivered":
      status = "delivered";
      break;
    case "email.failed":
      status = "failed";
      errorMessage = event.data.failed.reason;
      break;
    case "email.bounced":
      status = "failed";
      errorMessage = `${event.data.bounce.type}: ${event.data.bounce.message}`;
      break;
    case "email.suppressed":
      status = "failed";
      errorMessage = event.data.suppressed.message;
      break;
    default:
      return NextResponse.json({ received: true });
  }

  const now = new Date().toISOString();
  if (deliveryId && !isOurEmail) {
    return NextResponse.json({ received: true });
  }

  let updateQuery = supabase
    .from("devotional_email_deliveries")
    .update({
      status,
      error_message: errorMessage,
      delivered_at: status === "delivered" ? now : null,
      provider_message_id: event.data.email_id,
      updated_at: now,
    })
    .neq("status", "delivered");
  updateQuery = deliveryId
    ? updateQuery.eq("id", deliveryId)
    : updateQuery.eq("provider_message_id", event.data.email_id);
  const { data: updated, error } = await updateQuery.select("id");

  if (error) {
    console.error("Could not save Resend delivery event:", error.message);
    return NextResponse.json({ error: "Could not save delivery event." }, { status: 500 });
  }
  if (deliveryId && !updated.length) {
    return NextResponse.json(
      { error: "Delivery record is not ready for this event." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
