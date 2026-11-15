"use client";

import { useActionState } from "react";
import { confirmEmail } from "@/app/actions";
import type { FormState } from "@/lib/form-state";

const initialState: FormState = { message: "", success: false };

export default function ConfirmEmailForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(confirmEmail, initialState);

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />
      <button className="btn-primary" disabled={pending}>
        {pending ? "Confirming..." : "Confirm email"}
      </button>
      {state.message && (
        <p role={state.success ? "status" : "alert"} className="text-sm">
          {state.message}
        </p>
      )}
    </form>
  );
}
