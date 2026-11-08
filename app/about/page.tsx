import Link from "next/link";
import { ArrowRight, BookOpen, Heart } from "lucide-react";
import SiteHeader from "@/components/site-header";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[#173b35] px-5 py-16 text-center text-white">
          <p className="eyebrow text-[#d7bd79]">Our heart</p>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl">About Pastor K</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/75">
            A daily invitation to pause, spend time in God’s Word, and carry its hope into everyday life.
          </p>
        </section>
        <section className="mx-auto grid max-w-[1000px] gap-8 px-5 py-16 md:grid-cols-2">
          <article className="admin-card">
            <BookOpen className="text-[#a47c24]" />
            <h2 className="mt-5 font-serif text-3xl text-[#173b35]">Rooted in Scripture</h2>
            <p className="mt-3 leading-7 text-[#59645e]">
              Each devotional begins with Scripture and offers a thoughtful reflection and prayer to
              help you meet the day with faith.
            </p>
          </article>
          <article className="admin-card">
            <Heart className="text-[#a47c24]" />
            <h2 className="mt-5 font-serif text-3xl text-[#173b35]">Here for one another</h2>
            <p className="mt-3 leading-7 text-[#59645e]">
              This community is a place for encouragement, prayer, and a closer walk with God—wherever
              you are in your journey.
            </p>
          </article>
        </section>
        <section className="mx-auto max-w-[1000px] px-5 pb-16 text-center">
          <h2 className="font-serif text-3xl text-[#173b35]">We would love to hear from you.</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-primary">
              Contact us <ArrowRight size={16} />
            </Link>
            <Link href="/prayer-request" className="btn-secondary">
              Share a prayer request
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
