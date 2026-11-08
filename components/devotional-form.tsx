"use client";

import { useActionState } from "react";
import { Check, Send } from "lucide-react";
import { publishDevotional } from "@/app/actions";
import type { FormState } from "@/lib/form-state";

const initialState: FormState = { message: "", success: false };

export default function DevotionalForm({ readOnly = false }: { readOnly?: boolean }) {
  const [state, action, pending] = useActionState(publishDevotional, initialState);

  return (
    <form action={action} className="admin-card mt-7 space-y-5">
      <label className="form-label">
        Title
        <input name="title" required maxLength={160} className="field mt-2" disabled={readOnly} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="form-label">
          Scripture reference
          <input
            name="scripture_reference"
            required
            maxLength={120}
            placeholder="John 3:16"
            className="field mt-2"
            disabled={readOnly}
          />
        </label>
        <label className="form-label">
          Topic
          <input
            name="topic"
            required
            maxLength={80}
            placeholder="Faith"
            className="field mt-2"
            disabled={readOnly}
          />
        </label>
      </div>
      <label className="form-label">
        Short summary
        <textarea
          name="excerpt"
          required
          maxLength={500}
          rows={3}
          className="field mt-2"
          disabled={readOnly}
        />
      </label>
      <label className="form-label">
        Devotional
        <textarea
          name="body"
          required
          maxLength={30000}
          rows={10}
          className="field mt-2"
          disabled={readOnly}
        />
      </label>
      <label className="form-label">
        Closing prayer (optional)
        <textarea
          name="prayer"
          maxLength={3000}
          rows={3}
          className="field mt-2"
          disabled={readOnly}
        />
      </label>
      <p className="text-sm text-[#77827c]">
        {readOnly
          ? "Connect Supabase to enable publishing and save devotionals."
          : "Publishing makes this devotional visible on the public site. Email and text delivery are not connected yet."}
      </p>
      <button className="btn-primary" disabled={pending || readOnly}>
        <Send size={16} /> {pending ? "Publishing..." : "Publish devotional"}
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
