import SiteHeader from "@/components/site-header";
import MessageForm from "@/components/message-form";

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[760px] px-5 py-14 md:py-20">
        <p className="eyebrow">Get in touch</p>
        <h1 className="mt-3 font-serif text-5xl text-[#173b35]">Contact us</h1>
        <p className="mt-4 max-w-xl leading-7 text-[#59645e]">
          Have a question or want to share a note? Send us a message below.
        </p>
        <MessageForm kind="contact" />
      </main>
    </>
  );
}
