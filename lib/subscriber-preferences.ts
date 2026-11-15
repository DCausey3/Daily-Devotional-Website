import { createServiceClient } from "@/utils/supabase/service";
import { hashConfirmationToken } from "@/lib/subscriber-confirmation";

export type UnsubscribeChannel = "email" | "all";

export async function findSubscriberByPreferenceToken(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;

  const supabase = createServiceClient();
  const { data: preferenceToken, error: tokenError } = await supabase
    .from("subscriber_preference_tokens")
    .select("subscriber_id")
    .eq("token_hash", hashConfirmationToken(token))
    .maybeSingle();
  if (tokenError)
    throw new Error(`Could not validate subscriber preferences: ${tokenError.message}`);
  if (!preferenceToken) return null;

  const { data: subscriber, error: subscriberError } = await supabase
    .from("subscribers")
    .select("id, email, email_opt_in, email_status, sms_opt_in")
    .eq("id", preferenceToken.subscriber_id)
    .maybeSingle();
  if (subscriberError)
    throw new Error(`Could not load subscriber preferences: ${subscriberError.message}`);

  return subscriber;
}

export async function unsubscribeSubscriber(token: string, channel: UnsubscribeChannel) {
  const subscriber = await findSubscriberByPreferenceToken(token);
  if (!subscriber) return null;

  const now = new Date().toISOString();
  const updates = {
    ...(channel === "email" || channel === "all"
      ? {
          email_opt_in: false,
          email_status: "unsubscribed" as const,
          email_confirmed_at: null,
          email_confirmation_token_hash: null,
          email_confirmation_expires_at: null,
          email_confirmation_error: null,
          email_unsubscribed_at: now,
        }
      : {}),
    ...(channel === "all" ? { sms_opt_in: false } : {}),
  };

  const supabase = createServiceClient();
  const { error } = await supabase.from("subscribers").update(updates).eq("id", subscriber.id);
  if (error) throw new Error(`Could not update subscriber preferences: ${error.message}`);

  return subscriber;
}
