import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft, BookOpen } from "lucide-react";
import SiteHeader from "@/components/site-header";
import { createClient } from "@/utils/supabase/server";
import { isLocalPreview } from "@/lib/local-preview";
import { previewDevotionals } from "@/lib/local-preview-data";

export const dynamic = "force-dynamic";

export default async function DevotionalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let devotion;
  if (isLocalPreview()) {
    devotion = previewDevotionals.find((item) => item.id === id);
  } else {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase
      .from("devotionals")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(`Could not load the devotional: ${error.message}`);
    devotion = data;
  }
  if (!devotion) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[820px] px-5 py-14 md:py-20">
        <Link
          href="/devotionals"
          className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-[#52635d]"
        >
          <ArrowLeft size={16} /> Back to devotionals
        </Link>
        <header className="text-center">
          <p className="eyebrow">
            {new Date(devotion.published_at ?? devotion.created_at).toLocaleDateString("en-US", {
              dateStyle: "long",
              timeZone: "UTC",
            })}
          </p>
          <h1 className="mt-5 font-serif text-5xl leading-tight text-[#173b35] md:text-7xl">
            {devotion.title}
          </h1>
          <p className="mx-auto mt-6 flex items-center justify-center gap-2 text-sm font-bold text-[#a47c24]">
            <BookOpen size={16} /> {devotion.scripture_reference}
          </p>
          <div className="mx-auto mt-7 h-px w-16 bg-[#c9a95c]" />
        </header>
        <article className="prose-devotional mt-10">
          {devotion.body.split(/\n{2,}/).map((paragraph: string, index: number) => (
            <p key={index}>{paragraph}</p>
          ))}
        </article>
        {devotion.prayer && (
          <section className="mt-12 rounded-2xl bg-[#173b35] p-8 text-white md:p-10">
            <p className="text-xs font-bold tracking-widest text-[#d7bd79] uppercase">
              Closing prayer
            </p>
            <p className="mt-5 font-serif text-xl leading-8 text-white/90">{devotion.prayer}</p>
          </section>
        )}
      </main>
    </>
  );
}
