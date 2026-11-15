"use client";

import { useActionState } from "react";
import { unsubscribeFromChannel } from "@/app/actions";
import type { FormState } from "@/lib/form-state";

const initialState: FormState = { message: "", success: false };

export default function UnsubscribeForm({
  token,
  emailEnabled,
  smsEnabled,
}: {
  token: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
}) {
  const [state, action, pending] = useActionState(unsubscribeFromChannel, initialState);

  function option(channel: "email" | "all", label: string) {
    return (
      <form key={channel} action={action}>
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="channel" value={channel} />
        <button className="btn-secondary w-full justify-center" disabled={pending}>
          {pending ? "Updating..." : label}
        </button>
      </form>
    );
  }

  return (
    <div className="mt-7 space-y-3">
      {emailEnabled && option("email", "Unsubscribe from email")}
      {(emailEnabled || smsEnabled) && option("all", "Unsubscribe from all channels")}
      {!emailEnabled && !smsEnabled && (
        <p className="rounded-lg bg-[#edf1eb] p-4 text-sm text-[#29453f]">
          You are already unsubscribed from devotional messages.
        </p>
      )}
      {state.message && (
        <p role={state.success ? "status" : "alert"} className="text-sm text-[#29453f]">
          {state.message}
        </p>
      )}
    </div>
  );
}
