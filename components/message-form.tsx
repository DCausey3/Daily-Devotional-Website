"use client";

import { useActionState } from "react";
import { Check, Send } from "lucide-react";
import { submitContact, submitPrayerRequest } from "@/app/actions";
import type { FormState } from "@/lib/form-state";

const initialState: FormState = { message: "", success: false };

export default function MessageForm({ kind }: { kind: "contact" | "prayer" }) {
  const actionFunction = kind === "contact" ? submitContact : submitPrayerRequest;
  const [state, action, pending] = useActionState(actionFunction, initialState);
  const isPrayer = kind === "prayer";

  return (
    <form action={action} className="admin-card space-y-5">
      <label className="form-label">
        Name {isPrayer && <span className="font-normal text-[#77827c]">(optional)</span>}
        <input
          name="name"
          required={!isPrayer}
          maxLength={100}
          autoComplete="name"
          className="field mt-2"
        />
      </label>
      <label className="form-label">
        Email {isPrayer && <span className="font-normal text-[#77827c]">(optional)</span>}
        <input
          name="email"
          type="email"
          required={!isPrayer}
          maxLength={254}
          autoComplete="email"
          className="field mt-2"
        />
      </label>
      <label className="form-label">
        {isPrayer ? "Prayer request" : "Message"}
        <textarea
          name="message"
          required
          maxLength={5000}
          minLength={5}
          rows={7}
          className="field mt-2"
          placeholder={isPrayer ? "Share what you would like us to pray for..." : "How can we help?"}
        />
      </label>
      <button className="btn-primary" disabled={pending}>
        <Send size={16} /> {pending ? "Sending..." : isPrayer ? "Send prayer request" : "Send message"}
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
