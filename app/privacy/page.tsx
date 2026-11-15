import Link from "next/link";
import SiteHeader from "@/components/site-header";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-14">
        <p className="eyebrow">Subscriber information</p>
        <h1 className="mt-3 font-serif text-4xl text-[#173b35]">Email Privacy Notice</h1>
        <div className="mt-8 space-y-5 leading-7 text-[#59645e]">
          <p>
            When you subscribe, we collect the name and email address you provide and the time you
            submit your email consent. Email subscriptions require confirmation before devotional
            email begins.
          </p>
          <p>
            We use this information to send the devotional emails you requested, manage your
            preferences, and respond to support requests. We use service providers to store
            subscriber information and deliver email.
          </p>
          <p>
            You may stop email at any time using the unsubscribe link in an email. We retain
            subscription and opt-out records as needed to honor your choices and operate the email
            service.
          </p>
          <p>
            To ask a question or request help with your subscriber information, use our{" "}
            <Link href="/contact" className="font-semibold text-[#173b35] underline">
              contact form
            </Link>
            .
          </p>
          <p className="text-sm">
            Text messaging is currently disabled. This notice covers devotional email subscriptions
            and may be updated if the service changes.
          </p>
        </div>
      </main>
    </>
  );
}
