import Link from "next/link";
import SiteHeader from "@/components/site-header";

export default function EmailTermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-14">
        <p className="eyebrow">Subscriber information</p>
        <h1 className="mt-3 font-serif text-4xl text-[#173b35]">Email Terms</h1>
        <div className="mt-8 space-y-5 leading-7 text-[#59645e]">
          <p>
            By checking the email consent box, you ask to receive recurring devotional emails from
            Pastor K’s Daily Devotional. Emails begin after you confirm your email address. Consent
            is optional and is not a condition of purchase.
          </p>
          <p>
            Email frequency varies. Every devotional email includes an unsubscribe link. You may
            also use that link to opt out of all channels. Text messaging is currently disabled.
          </p>
          <p>Email delivery can be affected by provider filtering or outages.</p>
          <p>
            See our{" "}
            <Link href="/privacy" className="font-semibold text-[#173b35] underline">
              Email Privacy Notice
            </Link>{" "}
            for how subscription details are used. For help, use our{" "}
            <Link href="/contact" className="font-semibold text-[#173b35] underline">
              contact form
            </Link>
            .
          </p>
        </div>
      </main>
    </>
  );
}
