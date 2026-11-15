import ConfirmEmailForm from "@/components/confirm-email-form";

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-5 py-12">
      <section className="admin-card w-full">
        <p className="eyebrow">Daily Devotional</p>
        <h1 className="mt-2 font-serif text-3xl text-[#173b35]">Confirm your email</h1>
        <p className="mt-3 text-sm leading-6 text-[#59645e]">
          Confirm your email address to receive devotional messages. This link is valid for 48
          hours.
        </p>
        {token ? (
          <ConfirmEmailForm token={token} />
        ) : (
          <p role="alert" className="mt-5 text-sm text-red-700">
            This confirmation link is incomplete.
          </p>
        )}
      </section>
    </main>
  );
}
