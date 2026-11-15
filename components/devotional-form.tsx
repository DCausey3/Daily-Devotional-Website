"use client";

import { useState } from "react";
import { useActionState } from "react";
import type { ChangeEvent } from "react";
import { Check, Eye, Send } from "lucide-react";
import { publishDevotional, sendTestDevotional } from "@/app/actions";
import type { FormState } from "@/lib/form-state";

const initialState: FormState = { message: "", success: false };
const emptyDraft = {
  title: "",
  scripture_reference: "",
  topic: "",
  excerpt: "",
  body: "",
  prayer: "",
};
type Draft = typeof emptyDraft;

export default function DevotionalForm({ readOnly = false }: { readOnly?: boolean }) {
  const [fields, setFields] = useState<Draft>(emptyDraft);
  const [showPreview, setShowPreview] = useState(false);
  const [state, publishAction, publishPending] = useActionState(publishDevotional, initialState);
  const [testState, testAction, testPending] = useActionState(sendTestDevotional, initialState);
  const updateField =
    (field: keyof Draft) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((current) => ({ ...current, [field]: event.target.value }));
    };

  return (
    <div className="mt-7 space-y-4">
      <form action={publishAction} className="admin-card space-y-5">
        <label className="form-label">
          Title
          <input
            name="title"
            value={fields.title}
            onChange={updateField("title")}
            required
            maxLength={160}
            className="field mt-2"
            disabled={readOnly}
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="form-label">
            Scripture reference
            <input
              name="scripture_reference"
              value={fields.scripture_reference}
              onChange={updateField("scripture_reference")}
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
              value={fields.topic}
              onChange={updateField("topic")}
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
            value={fields.excerpt}
            onChange={updateField("excerpt")}
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
            value={fields.body}
            onChange={updateField("body")}
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
            value={fields.prayer}
            onChange={updateField("prayer")}
            maxLength={3000}
            rows={3}
            className="field mt-2"
            disabled={readOnly}
          />
        </label>
        <p className="text-sm text-[#77827c]">
          {readOnly
            ? "Connect Supabase to enable publishing and save devotionals."
            : "Publishing makes this devotional visible on the public site. Email is sent separately; SMS is currently disabled."}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowPreview((visible) => !visible)}
          >
            <Eye size={16} /> {showPreview ? "Hide preview" : "Preview devotional"}
          </button>
          <button className="btn-primary" disabled={publishPending || readOnly}>
            <Send size={16} /> {publishPending ? "Publishing..." : "Publish devotional"}
          </button>
        </div>
        {state.message && (
          <p role={state.success ? "status" : "alert"} className="flex items-center gap-2 text-sm">
            {state.success && <Check size={17} />}
            {state.message}
          </p>
        )}
      </form>

      {showPreview && (
        <article className="admin-card">
          <p className="eyebrow">{fields.topic || "Topic"}</p>
          <h3 className="mt-2 font-serif text-3xl text-[#173b35]">
            {fields.title || "Devotional title"}
          </h3>
          <p className="mt-2 text-sm font-semibold text-[#a47c24]">
            {fields.scripture_reference || "Scripture reference"}
          </p>
          <p className="mt-5 font-medium text-[#29453f]">{fields.excerpt || "Short summary"}</p>
          <div className="mt-5 space-y-4 whitespace-pre-wrap leading-7 text-[#59645e]">
            {fields.body || "Your devotional preview will appear here as you write."}
          </div>
          {fields.prayer && (
            <div className="mt-6 border-t border-[#173b35]/10 pt-5">
              <p className="eyebrow">Closing prayer</p>
              <p className="mt-2 whitespace-pre-wrap leading-7 text-[#59645e]">{fields.prayer}</p>
            </div>
          )}
        </article>
      )}

      <form action={testAction} className="admin-card space-y-3">
        {Object.entries(fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <div>
          <h3 className="font-semibold text-[#29453f]">Send a test email</h3>
          <p className="mt-1 text-sm text-[#77827c]">
            Send the current draft to the signed-in admin email without publishing it.
          </p>
        </div>
        <button className="btn-secondary" disabled={testPending || readOnly}>
          <Send size={16} /> {testPending ? "Sending test..." : "Send test to my admin email"}
        </button>
        {testState.message && (
          <p role={testState.success ? "status" : "alert"} className="text-sm">
            {testState.message}
          </p>
        )}
      </form>
    </div>
  );
}
