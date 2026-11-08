import SiteHeader from "@/components/site-header";
import MessageForm from "@/components/message-form";

export default function PrayerRequestPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[760px] px-5 py-14 md:py-20">
        <p className="eyebrow">You are not alone</p>
        <h1 className="mt-3 font-serif text-5xl text-[#173b35]">Prayer request</h1>
        <p className="mt-4 max-w-xl leading-7 text-[#59645e]">
          Share as much or as little as you feel comfortable sharing. Your request will be handled
          with care and seen by the ministry team.
        </p>
        <MessageForm kind="prayer" />
      </main>
    </>
  );
}
