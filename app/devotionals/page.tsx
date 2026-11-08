import Link from "next/link";
import { cookies } from "next/headers";
import SiteHeader from "@/components/site-header";
import { createClient } from "@/utils/supabase/server";
import type { Devotional } from "@/lib/database.types";
import { isLocalPreview } from "@/lib/local-preview";
import { previewDevotionals } from "@/lib/local-preview-data";

export const dynamic = "force-dynamic";

export default async function DevotionalsPage() {
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
      .order("published_at", { ascending: false });
    if (error) throw new Error(`Could not load the devotional archive: ${error.message}`);
    devotions = (data ?? []) as Devotional[];
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[#173b35] px-5 py-16 text-center text-white">
          <p className="eyebrow text-[#d7bd79]">Return to the well</p>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl">Devotional archive</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/65">
            Explore daily reflections by topic, scripture, or season.
          </p>
        </section>
        <section className="mx-auto grid max-w-[1100px] gap-8 px-5 py-12 md:grid-cols-2">
          {devotions.length ? (
            devotions.map((devotion) => (
              <article key={devotion.id} className="border-t border-[#c9a95c] pt-5">
                <p className="text-xs font-bold uppercase text-[#7a827d]">{devotion.topic}</p>
                <h2 className="mt-3 font-serif text-3xl text-[#173b35]">
                  <Link href={`/devotionals/${devotion.id}`} className="hover:text-[#a47c24]">
                    {devotion.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm font-bold text-[#a47c24]">
                  {devotion.scripture_reference}
                </p>
                <p className="mt-3 leading-7 text-[#59645e]">{devotion.excerpt}</p>
              </article>
            ))
          ) : (
            <p className="text-[#59645e]">No devotionals have been published yet.</p>
          )}
        </section>
      </main>
    </>
  );
}
