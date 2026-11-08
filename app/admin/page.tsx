import Link from "next/link";
import { ArrowUpRight, BookOpen, LogOut, Users } from "lucide-react";
import DevotionalForm from "@/components/devotional-form";
import { signOut } from "@/app/actions";
import { requireAdmin } from "@/lib/auth";
import type { Devotional, Subscriber } from "@/lib/database.types";
import { isLocalPreview } from "@/lib/local-preview";
import { previewDevotionals, previewSubscribers } from "@/lib/local-preview-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const localPreview = isLocalPreview();
  let activeSubscribers: Subscriber[];
  let recentDevotions: Devotional[];
  let publishedCount: number;
  let contactMessages: { id: string; name: string; email: string; message: string; created_at: string }[];
  let prayerRequests: { id: string; name: string | null; email: string | null; message: string; created_at: string }[];

  if (localPreview) {
    activeSubscribers = previewSubscribers;
    recentDevotions = previewDevotionals;
    publishedCount = previewDevotionals.length;
    contactMessages = [];
    prayerRequests = [];
  } else {
    const supabase = await requireAdmin();
    const [
      { data: subscribers, error: subscriberError },
      { data: devotionals, error: devotionalError },
      { count, error: publishedCountError },
      { data: messages, error: contactError },
      { data: prayers, error: prayerError },
    ] = await Promise.all([
      supabase
        .from("subscribers")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false }),
      supabase.from("devotionals").select("*").order("created_at", { ascending: false }).limit(10),
      supabase
        .from("devotionals")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("prayer_requests").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

    if (subscriberError) throw new Error(`Could not load subscribers: ${subscriberError.message}`);
    if (devotionalError) throw new Error(`Could not load devotionals: ${devotionalError.message}`);
    if (publishedCountError)
      throw new Error(`Could not count published devotionals: ${publishedCountError.message}`);
    if (contactError) throw new Error(`Could not load contact messages: ${contactError.message}`);
    if (prayerError) throw new Error(`Could not load prayer requests: ${prayerError.message}`);
    activeSubscribers = (subscribers ?? []) as Subscriber[];
    recentDevotions = (devotionals ?? []) as Devotional[];
    publishedCount = count ?? 0;
    contactMessages = messages ?? [];
    prayerRequests = prayers ?? [];
  }

  return (
    <main className="min-h-screen bg-[#f4f2eb]">
      <header className="border-b border-[#173b35]/10 bg-[#f9f7f1]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-5 md:px-8">
          <div>
            <p className="eyebrow">Pastor K’s workspace</p>
            <h1 className="mt-1 font-serif text-3xl text-[#173b35]">Admin dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {localPreview && (
              <span className="rounded-full bg-[#f0e5c7] px-3 py-1 text-xs font-bold text-[#795d20]">
                Local preview
              </span>
            )}
            <Link
              href="/"
              className="hidden items-center gap-2 text-sm font-semibold text-[#52635d] sm:flex"
            >
              View public site <ArrowUpRight size={16} />
            </Link>
            <form action={signOut}>
              <button className="btn-secondary">
                <LogOut size={16} /> Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1200px] px-5 py-8 md:px-8">
        {localPreview && (
          <p className="mb-6 rounded-lg border border-[#c9a95c]/40 bg-[#f7f0dd] p-4 text-sm text-[#66552c]">
            Preview mode: sample data only. Sign in with Supabase locally to save devotionals and view
            real subscribers.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="admin-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#738078]">Active subscribers</span>
              <Users size={20} className="text-[#426158]" />
            </div>
            <p className="mt-4 font-serif text-4xl text-[#173b35]">{activeSubscribers.length}</p>
            <p className="mt-1 text-xs text-[#8c958f]">
              Email subscribers with optional SMS consent
            </p>
          </section>
          <section className="admin-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#738078]">Published devotionals</span>
              <BookOpen size={20} className="text-[#426158]" />
            </div>
            <p className="mt-4 font-serif text-4xl text-[#173b35]">{publishedCount ?? 0}</p>
            <p className="mt-1 text-xs text-[#8c958f]">Most recent ten shown below</p>
          </section>
        </div>

        <section className="mt-8">
          <p className="eyebrow">Write</p>
          <h2 className="mt-2 font-serif text-3xl text-[#173b35]">Publish a devotional</h2>
          <DevotionalForm readOnly={localPreview} />
        </section>

        <section className="mt-10">
          <p className="eyebrow">Your community</p>
          <h2 className="mt-2 font-serif text-3xl text-[#173b35]">Active subscribers</h2>
          <div className="admin-card mt-5 overflow-x-auto p-0">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Text consent</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {activeSubscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td className="font-semibold text-[#29453f]">{subscriber.name}</td>
                    <td>{subscriber.email}</td>
                    <td>{subscriber.phone ?? "—"}</td>
                    <td>{subscriber.sms_opt_in ? "Opted in" : "No"}</td>
                    <td>{new Date(subscriber.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!activeSubscribers.length && (
                  <tr>
                    <td colSpan={5}>No active subscribers yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-3xl text-[#173b35]">Recent devotionals</h2>
          <div className="admin-card mt-5 overflow-x-auto p-0">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Scripture</th>
                  <th>Status</th>
                  <th>Published</th>
                </tr>
              </thead>
              <tbody>
                {recentDevotions.map((devotion) => (
                  <tr key={devotion.id}>
                    <td className="font-semibold text-[#29453f]">{devotion.title}</td>
                    <td>{devotion.scripture_reference}</td>
                    <td>{devotion.status}</td>
                    <td>
                      {devotion.published_at
                        ? new Date(devotion.published_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
                {!recentDevotions.length && (
                  <tr>
                    <td colSpan={4}>No devotionals published yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-3xl text-[#173b35]">Prayer requests</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {prayerRequests.map((request) => (
              <article key={request.id} className="admin-card">
                <p className="text-xs text-[#8c958f]">
                  {new Date(request.created_at).toLocaleString()}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#29453f]">
                  {request.name || "Anonymous"}
                  {request.email && <span className="ml-2 font-normal">{request.email}</span>}
                </p>
                <p className="mt-3 whitespace-pre-wrap leading-6 text-[#59645e]">{request.message}</p>
              </article>
            ))}
            {!prayerRequests.length && (
              <p className="text-sm text-[#77827c]">
                {localPreview ? "Prayer request submissions appear here after Supabase is connected." : "No prayer requests yet."}
              </p>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-3xl text-[#173b35]">Contact messages</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {contactMessages.map((message) => (
              <article key={message.id} className="admin-card">
                <p className="text-xs text-[#8c958f]">
                  {new Date(message.created_at).toLocaleString()}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#29453f]">
                  {message.name} · {message.email}
                </p>
                <p className="mt-3 whitespace-pre-wrap leading-6 text-[#59645e]">{message.message}</p>
              </article>
            ))}
            {!contactMessages.length && (
              <p className="text-sm text-[#77827c]">
                {localPreview ? "Contact submissions appear here after Supabase is connected." : "No contact messages yet."}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
