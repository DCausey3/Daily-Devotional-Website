"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { Resend } from "resend";
import { buildDevotionalEmail, escapeHtml } from "@/lib/devotional-email";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import type { FormState } from "@/lib/form-state";
import { isLocalPreview } from "@/lib/local-preview";
import { createConfirmationToken, hashConfirmationToken } from "@/lib/subscriber-confirmation";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

type DevotionalInput = {
  title: string;
  scripture_reference: string;
  topic: string;
  excerpt: string;
  body: string;
  prayer: string;
};

function readDevotionalInput(formData: FormData): DevotionalInput {
  return {
    title: value(formData, "title"),
    scripture_reference: value(formData, "scripture_reference"),
    topic: value(formData, "topic"),
    excerpt: value(formData, "excerpt"),
    body: value(formData, "body"),
    prayer: value(formData, "prayer"),
  };
}

function isValidDevotional(input: DevotionalInput) {
  return (
    input.title.length > 0 &&
    input.title.length <= 160 &&
    input.scripture_reference.length > 0 &&
    input.scripture_reference.length <= 120 &&
    input.topic.length > 0 &&
    input.topic.length <= 80 &&
    input.excerpt.length > 0 &&
    input.excerpt.length <= 500 &&
    input.body.length > 0 &&
    input.body.length <= 30000 &&
    input.prayer.length <= 3000
  );
}

async function sendConfirmationEmail(email: string, name: string, token: string, origin: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return "Email confirmation is not configured.";

  const confirmationUrl = new URL("/confirm-email", origin);
  confirmationUrl.searchParams.set("token", token);
  try {
    const { data, error } = await new Resend(apiKey).emails.send({
      from,
      to: email,
      subject: "Confirm your devotional email subscription",
      html: `<p>Hello ${escapeHtml(name)},</p><p>Please confirm that you want to receive devotional emails.</p><p><a href="${confirmationUrl}">Confirm email subscription</a></p><p>If you did not request this, you can ignore this message.</p>`,
      text: `Hello ${name},\n\nPlease confirm that you want to receive devotional emails:\n${confirmationUrl}\n\nIf you did not request this, you can ignore this message.`,
    });
    if (error) return error.message;
    return data?.id ? null : "Resend did not return an email ID.";
  } catch (error) {
    return error instanceof Error ? error.message : "Resend request failed.";
  }
}

export async function subscribe(_previous: FormState, formData: FormData): Promise<FormState> {
  const name = value(formData, "name");
  const email = value(formData, "email").toLowerCase();
  const phone = value(formData, "phone");
  const emailOptIn = formData.get("email_opt_in") === "on";
  const smsOptIn = formData.get("sms_opt_in") === "on";

  if (
    !name ||
    name.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254
  ) {
    return { success: false, message: "Enter a valid name and email address." };
  }
  if (!emailOptIn && !smsOptIn) {
    return { success: false, message: "Choose email, text, or both to join the community." };
  }
  if ((phone && (phone.length < 7 || phone.length > 32)) || (smsOptIn && !phone)) {
    return { success: false, message: "Enter a valid phone number to opt in to text messages." };
  }
  if (isLocalPreview()) {
    return {
      success: true,
      message: "Preview only: Supabase is not configured, so your subscription was not saved.",
    };
  }

  const requestOrigin = (await headers()).get("origin");
  if (emailOptIn && !requestOrigin) {
    return { success: false, message: "Could not create an email confirmation link. Try again." };
  }

  const token = emailOptIn ? createConfirmationToken() : null;
  const supabase = createServiceClient();
  const { data: subscriber, error } = await supabase
    .from("subscribers")
    .insert({
      name,
      email,
      phone: phone || null,
      email_opt_in: emailOptIn,
      email_status: emailOptIn ? "pending" : "unsubscribed",
      email_confirmation_token_hash: token?.tokenHash ?? null,
      email_confirmation_expires_at: token
        ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        : null,
      email_confirmation_error: null,
      sms_opt_in: smsOptIn,
    })
    .select("id")
    .single();

  if (error?.code === "23505") {
    return {
      success: false,
      message:
        "This email is already in the subscriber list. Contact the site administrator to update its preferences.",
    };
  }
  if (error) throw new Error(`Could not save your subscription: ${error.message}`);

  if (emailOptIn && token && requestOrigin) {
    const confirmationError = await sendConfirmationEmail(email, name, token.token, requestOrigin);
    if (confirmationError) {
      const { error: saveError } = await supabase
        .from("subscribers")
        .update({ email_confirmation_error: confirmationError })
        .eq("id", subscriber.id);
      if (saveError)
        throw new Error(`Could not save confirmation email failure: ${saveError.message}`);
      revalidatePath("/admin");
      return {
        success: false,
        message:
          "Your preferences were saved, but the confirmation email could not be sent. Please contact the site administrator.",
      };
    }
  }

  revalidatePath("/admin");
  return {
    success: true,
    message: emailOptIn
      ? "Check your inbox and confirm your email to receive devotionals."
      : "Your text preference was saved. Text delivery is not available yet.",
  };
}

export async function confirmEmail(_previous: FormState, formData: FormData): Promise<FormState> {
  const token = value(formData, "token");
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return { success: false, message: "This confirmation link is invalid or expired." };
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();
  const { data: subscriber, error: lookupError } = await supabase
    .from("subscribers")
    .select("id")
    .eq("email_confirmation_token_hash", hashConfirmationToken(token))
    .eq("email_status", "pending")
    .gt("email_confirmation_expires_at", now)
    .maybeSingle();
  if (lookupError)
    throw new Error(`Could not verify the email confirmation: ${lookupError.message}`);
  if (!subscriber) {
    return { success: false, message: "This confirmation link is invalid or expired." };
  }

  const { error } = await supabase
    .from("subscribers")
    .update({
      email_opt_in: true,
      email_status: "confirmed",
      email_confirmed_at: now,
      email_confirmation_token_hash: null,
      email_confirmation_expires_at: null,
      email_confirmation_error: null,
    })
    .eq("id", subscriber.id);
  if (error) throw new Error(`Could not confirm the email address: ${error.message}`);

  revalidatePath("/admin");
  return { success: true, message: "Your email is confirmed. You can now receive devotionals." };
}

export async function submitContact(_previous: FormState, formData: FormData): Promise<FormState> {
  const name = value(formData, "name");
  const email = value(formData, "email").toLowerCase();
  const message = value(formData, "message");

  if (
    !name ||
    name.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    message.length < 5 ||
    message.length > 5000
  ) {
    return { success: false, message: "Check your name, email, and message, then try again." };
  }
  if (isLocalPreview()) {
    return {
      success: true,
      message: "Preview only: Supabase is not configured, so your message was not saved.",
    };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from("contact_messages").insert({ name, email, message });
  if (error) throw new Error(`Could not save your message: ${error.message}`);

  revalidatePath("/admin");
  return { success: true, message: "Your message has been received. Thank you for reaching out." };
}

export async function submitPrayerRequest(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = value(formData, "name");
  const email = value(formData, "email").toLowerCase();
  const message = value(formData, "message");

  if (
    name.length > 100 ||
    email.length > 254 ||
    (email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
    message.length < 5 ||
    message.length > 5000
  ) {
    return { success: false, message: "Check your details and prayer request, then try again." };
  }
  if (isLocalPreview()) {
    return {
      success: true,
      message: "Preview only: Supabase is not configured, so your prayer request was not saved.",
    };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from("prayer_requests").insert({
    name: name || null,
    email: email || null,
    message,
  });
  if (error) throw new Error(`Could not save your prayer request: ${error.message}`);

  revalidatePath("/admin");
  return { success: true, message: "Your prayer request has been received with care." };
}

export async function signIn(_previous: FormState, formData: FormData): Promise<FormState> {
  if (isLocalPreview()) {
    return {
      success: false,
      message: "Sign-in requires Supabase. Use the local preview link instead.",
    };
  }

  const email = value(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { success: false, message: "Enter your email and password." };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error)
    return { success: false, message: "Sign-in failed. Check your credentials and try again." };

  const { data: isAdmin, error: roleError } = await supabase.rpc("is_admin");
  if (roleError) throw new Error(`Could not verify admin access: ${roleError.message}`);
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { success: false, message: "This account does not have admin access." };
  }

  redirect("/admin");
}

export async function signOut() {
  if (isLocalPreview()) redirect("/admin/login");

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Could not sign out: ${error.message}`);
  redirect("/admin/login");
}

export async function publishDevotional(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (isLocalPreview()) {
    return { success: false, message: "Publishing is disabled in local preview mode." };
  }

  const supabase = await requireAdmin();
  const devotional = readDevotionalInput(formData);
  if (!isValidDevotional(devotional)) {
    return { success: false, message: "Complete each required field within its listed length." };
  }

  const { error } = await supabase.from("devotionals").insert({
    ...devotional,
    prayer: devotional.prayer || null,
    status: "published",
    published_at: new Date().toISOString(),
  });
  if (error) throw new Error(`Could not publish the devotional: ${error.message}`);

  revalidatePath("/");
  revalidatePath("/devotionals");
  revalidatePath("/admin");
  return {
    success: true,
    message: "Devotional published. Use its Send action to email confirmed subscribers.",
  };
}

export async function sendTestDevotional(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (isLocalPreview()) {
    return { success: false, message: "Test email is disabled in local preview mode." };
  }

  const supabase = await requireAdmin();
  const devotional = readDevotionalInput(formData);
  if (!isValidDevotional(devotional)) {
    return { success: false, message: "Complete the devotional fields before sending a test." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw new Error(`Could not load the admin email address: ${userError.message}`);
  if (!user?.email) {
    return {
      success: false,
      message: "The signed-in admin account does not have an email address.",
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return { success: false, message: "Email delivery is not configured." };
  }

  try {
    const { data, error } = await new Resend(apiKey).emails.send({
      from,
      to: user.email,
      ...buildDevotionalEmail({ ...devotional, prayer: devotional.prayer || null }),
      tags: [{ name: "app", value: "daily_devotional_test" }],
    });
    if (error) return { success: false, message: `Test email failed: ${error.message}` };
    if (!data?.id) return { success: false, message: "Resend did not return a test email ID." };
  } catch (error) {
    return {
      success: false,
      message: `Test email failed: ${error instanceof Error ? error.message : "Resend request failed."}`,
    };
  }

  return { success: true, message: `Test email accepted for ${user.email}.` };
}

export async function saveSubscriberPreferences(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (isLocalPreview()) {
    return { success: false, message: "Subscriber management is disabled in local preview mode." };
  }

  const supabase = await requireAdmin();
  const subscriberId = value(formData, "subscriber_id");
  const name = value(formData, "name");
  const phone = value(formData, "phone");
  const emailOptIn = formData.get("email_opt_in") === "on";
  const smsOptIn = formData.get("sms_opt_in") === "on";
  if (!subscriberId || !name || name.length > 100) {
    return { success: false, message: "Enter a valid name." };
  }
  if ((phone && (phone.length < 7 || phone.length > 32)) || (smsOptIn && !phone)) {
    return { success: false, message: "A valid phone number is required for text consent." };
  }

  const { data: subscriber, error: subscriberError } = await supabase
    .from("subscribers")
    .select("id, email, email_status, email_confirmed_at")
    .eq("id", subscriberId)
    .single();
  if (subscriberError)
    throw new Error(`Could not load subscriber preferences: ${subscriberError.message}`);

  let emailStatus: "pending" | "confirmed" | "unsubscribed";
  let emailConfirmedAt: string | null;
  let token: ReturnType<typeof createConfirmationToken> | null = null;
  let tokenExpiresAt: string | null = null;
  if (!emailOptIn) {
    emailStatus = "unsubscribed";
    emailConfirmedAt = null;
  } else if (subscriber.email_status === "confirmed") {
    emailStatus = "confirmed";
    emailConfirmedAt = subscriber.email_confirmed_at;
  } else {
    emailStatus = "pending";
    emailConfirmedAt = null;
    token = createConfirmationToken();
    tokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  }

  const { error: updateError } = await supabase
    .from("subscribers")
    .update({
      name,
      phone: phone || null,
      email_opt_in: emailOptIn,
      email_status: emailStatus,
      email_confirmed_at: emailConfirmedAt,
      email_confirmation_token_hash: token?.tokenHash ?? null,
      email_confirmation_expires_at: tokenExpiresAt,
      email_confirmation_error: null,
      sms_opt_in: smsOptIn,
    })
    .eq("id", subscriberId);
  if (updateError) throw new Error(`Could not save subscriber preferences: ${updateError.message}`);

  if (token) {
    const origin = (await headers()).get("origin");
    const confirmationError = origin
      ? await sendConfirmationEmail(subscriber.email, name, token.token, origin)
      : "Could not create an email confirmation link.";
    if (confirmationError) {
      const { error: saveError } = await supabase
        .from("subscribers")
        .update({ email_confirmation_error: confirmationError })
        .eq("id", subscriberId);
      if (saveError)
        throw new Error(`Could not save confirmation email failure: ${saveError.message}`);
      revalidatePath("/admin");
      return {
        success: false,
        message: "Preferences saved, but the confirmation email could not be sent.",
      };
    }
  }

  revalidatePath("/admin");
  return {
    success: true,
    message: token ? "Preferences saved; a new confirmation email was sent." : "Preferences saved.",
  };
}

export async function sendDevotional(_previous: FormState, formData: FormData): Promise<FormState> {
  if (isLocalPreview()) {
    return { success: false, message: "Email delivery is disabled in local preview mode." };
  }

  const supabase = await requireAdmin();
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!resendApiKey || !from) {
    throw new Error("Email delivery is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.");
  }

  const devotionalId = value(formData, "devotional_id");
  if (!devotionalId) return { success: false, message: "Choose a devotional to send." };

  const { data: devotional, error: devotionalError } = await supabase
    .from("devotionals")
    .select("*")
    .eq("id", devotionalId)
    .eq("status", "published")
    .single();
  if (devotionalError)
    throw new Error(`Could not load the devotional for email: ${devotionalError.message}`);

  const { data: subscribers, error: subscriberError } = await supabase
    .from("subscribers")
    .select("id, email")
    .eq("email_opt_in", true)
    .eq("email_status", "confirmed");
  if (subscriberError)
    throw new Error(`Could not load confirmed email subscribers: ${subscriberError.message}`);
  if (!subscribers.length) {
    return { success: false, message: "There are no confirmed email subscribers to email." };
  }

  const { error: seedError } = await supabase.from("devotional_email_deliveries").upsert(
    subscribers.map((subscriber) => ({
      devotional_id: devotional.id,
      subscriber_id: subscriber.id,
      recipient_email: subscriber.email.toLowerCase(),
    })),
    { onConflict: "devotional_id,recipient_email", ignoreDuplicates: true },
  );
  if (seedError) throw new Error(`Could not prepare email delivery records: ${seedError.message}`);

  const staleSendingBefore = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const [eligibleResult, staleResult] = await Promise.all([
    supabase
      .from("devotional_email_deliveries")
      .select("*")
      .eq("devotional_id", devotional.id)
      .in("status", ["queued", "failed"]),
    supabase
      .from("devotional_email_deliveries")
      .select("*")
      .eq("devotional_id", devotional.id)
      .eq("status", "sending")
      .lt("updated_at", staleSendingBefore),
  ]);
  if (eligibleResult.error)
    throw new Error(`Could not load pending email deliveries: ${eligibleResult.error.message}`);
  if (staleResult.error)
    throw new Error(`Could not load interrupted email deliveries: ${staleResult.error.message}`);

  const pendingDeliveries = [...(eligibleResult.data ?? []), ...(staleResult.data ?? [])];
  if (!pendingDeliveries.length) {
    return { success: true, message: "No queued or failed email deliveries need sending." };
  }

  const resend = new Resend(resendApiKey);
  const emailContent = buildDevotionalEmail(devotional);

  let accepted = 0;
  let failed = 0;
  for (let offset = 0; offset < pendingDeliveries.length; offset += 5) {
    const batch = pendingDeliveries.slice(offset, offset + 5);
    await Promise.all(
      batch.map(async (delivery) => {
        const claimedAt = new Date().toISOString();
        let claimQuery = supabase
          .from("devotional_email_deliveries")
          .update({
            status: "sending",
            attempt_count: delivery.attempt_count + 1,
            error_message: null,
            updated_at: claimedAt,
          })
          .eq("id", delivery.id)
          .eq("status", delivery.status);
        if (delivery.status === "sending") {
          claimQuery = claimQuery.lt("updated_at", staleSendingBefore);
        }
        const { data: claimed, error: claimError } = await claimQuery.select("id").maybeSingle();
        if (claimError) throw new Error(`Could not claim an email delivery: ${claimError.message}`);
        if (!claimed) return;

        let messageId: string | null = null;
        let errorMessage: string | null = null;
        try {
          const result = await resend.emails.send({
            from,
            to: delivery.recipient_email,
            ...emailContent,
            tags: [
              { name: "app", value: "daily_devotional" },
              { name: "delivery_id", value: delivery.id },
            ],
          });
          if (result.error) errorMessage = result.error.message;
          else messageId = result.data?.id ?? null;
          if (!errorMessage && !messageId) errorMessage = "Resend did not return an email ID.";
        } catch (error) {
          errorMessage = error instanceof Error ? error.message : "Resend request failed.";
        }

        const sentAt = errorMessage ? null : new Date().toISOString();
        const { error: updateError } = await supabase
          .from("devotional_email_deliveries")
          .update({
            status: errorMessage ? "failed" : "sent",
            provider_message_id: messageId,
            error_message: errorMessage,
            sent_at: sentAt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", delivery.id)
          .eq("status", "sending");
        if (updateError)
          throw new Error(`Could not save an email delivery result: ${updateError.message}`);

        if (errorMessage) failed += 1;
        else accepted += 1;
      }),
    );
  }

  revalidatePath("/admin");
  return {
    success: failed === 0,
    message: `${accepted} email${accepted === 1 ? "" : "s"} accepted by Resend; ${failed} failed. Delivery confirmation will update from the Resend webhook.`,
  };
}
