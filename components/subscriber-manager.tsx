"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { saveSubscriberPreferences } from "@/app/actions";
import type { Subscriber } from "@/lib/database.types";
import type { FormState } from "@/lib/form-state";

const initialState: FormState = { message: "", success: false };

function SubscriberRow({ subscriber, readOnly }: { subscriber: Subscriber; readOnly: boolean }) {
  const [state, action, pending] = useActionState(saveSubscriberPreferences, initialState);

  return (
    <tr>
      <td>
        <input
          name="name"
          form={`subscriber-${subscriber.id}`}
          defaultValue={subscriber.name}
          maxLength={100}
          required
          className="field min-w-32"
          disabled={readOnly}
        />
      </td>
      <td className="font-semibold text-[#29453f]">{subscriber.email}</td>
      <td>
        <span className="font-semibold capitalize">{subscriber.email_status}</span>
        {subscriber.email_confirmation_error && (
          <p className="mt-1 max-w-xs text-xs text-red-700">
            {subscriber.email_confirmation_error}
          </p>
        )}
        {subscriber.email_confirmed_at && (
          <p className="mt-1 text-xs text-[#8c958f]">
            {new Date(subscriber.email_confirmed_at).toLocaleDateString()}
          </p>
        )}
      </td>
      <td>
        <input
          name="email_opt_in"
          form={`subscriber-${subscriber.id}`}
          type="checkbox"
          defaultChecked={subscriber.email_opt_in}
          className="accent-[#173b35]"
          disabled={readOnly}
          aria-label={`Email preference for ${subscriber.email}`}
        />
        <span className="ml-2 text-xs">Email</span>
      </td>
      <td>{new Date(subscriber.created_at).toLocaleDateString()}</td>
      <td>
        <form id={`subscriber-${subscriber.id}`} action={action} className="space-y-2">
          <input type="hidden" name="subscriber_id" value={subscriber.id} />
          <button className="btn-secondary text-xs" disabled={pending || readOnly}>
            {pending ? "Saving..." : "Save"}
          </button>
          {state.message && (
            <p role={state.success ? "status" : "alert"} className="max-w-56 text-xs">
              {state.message}
            </p>
          )}
        </form>
      </td>
    </tr>
  );
}

export default function SubscriberManager({
  subscribers,
  readOnly = false,
}: {
  subscribers: Subscriber[];
  readOnly?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [emailFilter, setEmailFilter] = useState("all");
  const filteredSubscribers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return subscribers.filter((subscriber) => {
      const matchesTerm =
        !term || [subscriber.name, subscriber.email].join(" ").toLowerCase().includes(term);
      return matchesTerm && (emailFilter === "all" || subscriber.email_status === emailFilter);
    });
  }, [emailFilter, search, subscribers]);

  return (
    <div className="admin-card mt-5 overflow-x-auto p-0">
      <div className="flex flex-col gap-3 border-b border-[#173b35]/10 p-4 sm:flex-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name or email"
          className="field sm:max-w-sm"
          aria-label="Search subscribers"
        />
        <select
          value={emailFilter}
          onChange={(event) => setEmailFilter(event.target.value)}
          className="field sm:max-w-48"
          aria-label="Filter by email status"
        >
          <option value="all">All email statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Email status</th>
            <th>Email</th>
            <th>Joined</th>
            <th>Manage</th>
          </tr>
        </thead>
        <tbody>
          {filteredSubscribers.map((subscriber) => (
            <SubscriberRow
              key={`${subscriber.id}:${subscriber.email_status}`}
              subscriber={subscriber}
              readOnly={readOnly}
            />
          ))}
          {!filteredSubscribers.length && (
            <tr>
              <td colSpan={6}>No subscribers match these filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
