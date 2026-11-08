"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/form-state";
import { isLocalPreview } from "@/lib/local-preview";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function subscribe(_previous: FormState, formData: FormData): Promise<FormState> {
  const name = value(formData, "name");
  const email = value(formData, "email").toLowerCase();
  const phone = value(formData, "phone");
  const smsOptIn = formData.get("sms_opt_in") === "on";

  if (
    !name ||
    name.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254
  ) {
    return { success: false, message: "Enter a valid name and email address." };
  }
  if (phone.length > 32 || (smsOptIn && !phone)) {
    return { success: false, message: "Enter a phone number to opt in to text messages." };
  }
  if (isLocalPreview()) {
    return {
      success: true,
      message: "Preview only: Supabase is not configured, so your subscription was not saved.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("subscribers").insert({
    name,
    email,
    phone: phone || null,
    sms_opt_in: smsOptIn,
    status: "active",
  });

  if (error?.code === "23505") {
    return { success: true, message: "This email is already subscribed." };
  }
  if (error) throw new Error(`Could not save your subscription: ${error.message}`);

  revalidatePath("/admin");
  return { success: true, message: "You’re subscribed. Thank you for joining the community." };
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

  const supabase = await createClient();
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

  const supabase = await createClient();
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

  const supabase = await createClient();
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

  const supabase = await createClient();
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
  const title = value(formData, "title");
  const scriptureReference = value(formData, "scripture_reference");
  const topic = value(formData, "topic");
  const excerpt = value(formData, "excerpt");
  const body = value(formData, "body");
  const prayer = value(formData, "prayer");

  if (
    !title ||
    title.length > 160 ||
    !scriptureReference ||
    scriptureReference.length > 120 ||
    !topic ||
    topic.length > 80 ||
    !excerpt ||
    excerpt.length > 500 ||
    !body ||
    body.length > 30000 ||
    prayer.length > 3000
  ) {
    return { success: false, message: "Complete each required field within its listed length." };
  }

  const { error } = await supabase.from("devotionals").insert({
    title,
    scripture_reference: scriptureReference,
    topic,
    excerpt,
    body,
    prayer: prayer || null,
    status: "published",
    published_at: new Date().toISOString(),
  });
  if (error) throw new Error(`Could not publish the devotional: ${error.message}`);

  revalidatePath("/");
  revalidatePath("/devotionals");
  revalidatePath("/admin");
  return { success: true, message: "Devotional published. No emails or texts were sent." };
}
