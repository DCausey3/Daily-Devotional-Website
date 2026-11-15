import Link from "next/link";
import UnsubscribeForm from "@/components/unsubscribe-form";
import { findSubscriberByPreferenceToken } from "@/lib/subscriber-preferences";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Manage messaging preferences | Daily Devotional",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const subscriber = token ? await findSubscriberByPreferenceToken(token) : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-5 py-12">
      <section className="admin-card w-full">
        <p className="eyebrow">Daily Devotional</p>
        <h1 className="mt-2 font-serif text-3xl text-[#173b35]">Manage message preferences</h1>
        {subscriber && token ? (
          <>
            <p className="mt-3 text-sm leading-6 text-[#59645e]">
              Choose whether to stop email or all devotional messages.
            </p>
            <UnsubscribeForm
              token={token}
              emailEnabled={subscriber.email_opt_in}
              smsEnabled={subscriber.sms_opt_in}
            />
          </>
        ) : (
          <>
            <p role="alert" className="mt-3 text-sm leading-6 text-[#59645e]">
              This preference link is invalid. Use the unsubscribe link from a recent devotional
              email or contact us for help.
            </p>
            <Link href="/contact" className="btn-primary mt-6">
              Contact us
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
