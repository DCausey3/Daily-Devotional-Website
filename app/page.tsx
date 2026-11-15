import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, BookOpen } from "lucide-react";
import SiteHeader from "@/components/site-header";
import SubscribeForm from "@/components/subscribe-form";
import { createClient } from "@/utils/supabase/server";
import type { Devotional } from "@/lib/database.types";
import { isLocalPreview } from "@/lib/local-preview";
import { previewDevotionals } from "@/lib/local-preview-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let devotions: Devotional[];
  if (isLocalPreview()) {
    devotions = previewDevotionals;
  } else {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase
      .from("devotionals")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(4);
    if (error) throw new Error(`Could not load published devotionals: ${error.message}`);
    devotions = (data ?? []) as Devotional[];
  }
  const today = devotions[0];

  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 md:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-20">
          <div>
            <p className="eyebrow mb-6">A quiet moment, daily</p>
            {today ? (
              <>
                <p className="mb-4 text-sm font-semibold text-[#6a746e]">
                  {new Date(today.published_at ?? today.created_at).toLocaleDateString("en-US", {
                    dateStyle: "long",
                    timeZone: "UTC",
                  })}
                </p>
                <h1 className="max-w-xl font-serif text-5xl leading-[1.02] tracking-[-.025em] text-[#173b35] md:text-7xl">
                  {today.title}
                </h1>
                <div className="my-7 flex items-center gap-3 text-sm font-bold text-[#173b35]">
                  <BookOpen size={18} className="text-[#b18a34]" /> {today.scripture_reference}
                </div>
                <p className="max-w-xl font-serif text-xl leading-8 text-[#48564f]">
                  {today.excerpt}
                </p>
                <Link href={`/devotionals/${today.id}`} className="btn-primary mt-9">
                  Read Today’s Devotional <ArrowRight size={17} />
                </Link>
              </>
            ) : (
              <>
                <h1 className="max-w-xl font-serif text-5xl leading-tight text-[#173b35] md:text-7xl">
                  Begin your day rooted in truth.
                </h1>
                <p className="mt-6 max-w-xl font-serif text-xl leading-8 text-[#48564f]">
                  Daily encouragement to help you slow down, hear God clearly, and walk faithfully.
                  The first devotional will appear here as soon as it is published.
                </p>
              </>
            )}
          </div>
          <div className="relative hidden min-h-[430px] overflow-hidden rounded-[140px_140px_24px_24px] bg-[#173b35] lg:block">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,#173b35,#617468)]" />
            <div className="absolute inset-x-8 bottom-10 border-l border-[#d7bd79] pl-5 font-serif text-2xl leading-9 text-white">
              “They that wait upon the Lord shall renew their strength.”
            </div>
          </div>
        </section>

        <section className="border-y border-[#1d453d]/10 bg-[#efeade]">
          <div className="mx-auto grid max-w-[1200px] gap-7 px-5 py-10 md:grid-cols-[.7fr_1.3fr] md:items-center md:px-8">
            <div>
              <p className="eyebrow">A quiet moment, daily</p>
              <h2 className="mt-2 font-serif text-3xl text-[#173b35]">
                Receive daily encouragement.
              </h2>
            </div>
            <SubscribeForm />
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-5 py-16 md:px-8">
          <div className="mb-9 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Continue in the Word</p>
              <h2 className="mt-3 font-serif text-4xl text-[#173b35]">Recent devotionals</h2>
            </div>
            <Link
              href="/devotionals"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#173b35]"
            >
              View archive <ArrowRight size={16} />
            </Link>
          </div>
          {devotions.length ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {devotions.slice(1).map((devotion) => (
                <article key={devotion.id} className="border-t-4 border-[#c9a95c] pt-5">
                  <p className="text-xs font-bold tracking-wide text-[#7a827d] uppercase">
                    {devotion.topic}
                  </p>
                  <h3 className="mt-3 font-serif text-3xl leading-tight text-[#173b35]">
                    <Link href={`/devotionals/${devotion.id}`} className="hover:text-[#a47c24]">
                      {devotion.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-sm font-bold text-[#a47c24]">
                    {devotion.scripture_reference}
                  </p>
                  <p className="mt-4 leading-7 text-[#59645e]">{devotion.excerpt}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-[#59645e]">New reflections will be shared here.</p>
          )}
        </section>
      </main>
      <footer className="bg-[#112f2b] px-5 py-10 text-center text-sm text-white/70">
        <p>Daily encouragement to help you walk faithfully.</p>
        <nav className="mt-4 flex justify-center gap-5">
          <Link href="/terms" className="underline underline-offset-4">
            Email terms
          </Link>
          <Link href="/privacy" className="underline underline-offset-4">
            Email privacy
          </Link>
          <Link href="/contact" className="underline underline-offset-4">
            Contact
          </Link>
        </nav>
      </footer>
    </>
  );
}
