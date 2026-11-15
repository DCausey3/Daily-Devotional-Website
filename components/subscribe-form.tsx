"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { subscribe } from "@/app/actions";
import type { FormState } from "@/lib/form-state";

const initialState: FormState = { message: "", success: false };

export default function SubscribeForm() {
  const [state, action, pending] = useActionState(subscribe, initialState);

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="sr-only" htmlFor="subscriber-name">
          Name
        </label>
        <input
          id="subscriber-name"
          name="name"
          required
          maxLength={100}
          placeholder="Your name"
          className="field"
        />
        <label className="sr-only" htmlFor="subscriber-email">
          Email address
        </label>
        <input
          id="subscriber-email"
          name="email"
          type="email"
          required
          maxLength={254}
          placeholder="Your email address"
          className="field"
        />
      </div>
      <label className="sr-only" htmlFor="subscriber-phone">
        Phone number (optional)
      </label>
      <input
        id="subscriber-phone"
        name="phone"
        type="tel"
        maxLength={32}
        placeholder="Phone number (optional)"
        className="field"
      />
      <label className="flex items-start gap-2 text-sm leading-5 text-[#59645e]">
        <input name="email_opt_in" type="checkbox" className="mt-1 accent-[#173b35]" />
        I agree to receive devotional emails. Please confirm by email. You can unsubscribe any time.
      </label>
      <label className="flex items-start gap-2 text-sm leading-5 text-[#59645e]">
        <input name="sms_opt_in" type="checkbox" className="mt-1 accent-[#173b35]" />
        I agree to receive devotional text messages. Message and data rates may apply.
      </label>
      <button className="btn-gold w-full sm:w-auto" disabled={pending}>
        {pending ? "Saving preferences..." : "Join the Community"}
      </button>
      {state.message && (
        <p role={state.success ? "status" : "alert"} className="flex items-center gap-2 text-sm">
          {state.success && <Check size={17} />}
          {state.message}
        </p>
      )}
    </form>
  );
}
