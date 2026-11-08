"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Feather } from "lucide-react";
import { signIn } from "@/app/actions";
import type { FormState } from "@/lib/form-state";
import { isLocalPreview } from "@/lib/local-preview";

const initialState: FormState = { message: "", success: false };

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(signIn, initialState);
  const localPreview = isLocalPreview();

  return (
    <main className="grid min-h-screen bg-[#f4f1e8] lg:grid-cols-2">
      <div className="hidden bg-[#173b35] p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Feather className="text-[#d7bd79]" />
          <span className="font-serif text-2xl">Pastor K</span>
        </Link>
        <p className="font-serif text-5xl leading-tight">“Feed my sheep.”</p>
        <p className="text-xs text-white/40">John 21:17</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <form
          action={action}
          className="w-full max-w-md rounded-2xl border border-[#173b35]/10 bg-white p-7 shadow-sm md:p-10"
        >
          <p className="eyebrow">Admin portal</p>
          <h1 className="mt-3 font-serif text-4xl text-[#173b35]">Welcome back.</h1>
          <p className="mt-3 text-sm text-[#6f7973]">Sign in to write and publish devotionals.</p>
          {localPreview ? (
            <div className="mt-8 rounded-lg border border-[#c9a95c]/40 bg-[#f7f0dd] p-4 text-sm text-[#66552c]">
              Supabase is not configured. You can preview the dashboard with sample data.
              <Link href="/admin" className="btn-primary mt-4 w-full justify-center">
                Open local dashboard <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <>
              <label className="form-label mt-8">
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  className="field mt-2"
                />
              </label>
              <label className="form-label mt-5">
                Password
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="field mt-2"
                />
              </label>
              <button className="btn-primary mt-7 w-full justify-center py-4" disabled={pending}>
                {pending ? "Signing in..." : "Sign in"} <ArrowRight size={17} />
              </button>
            </>
          )}
          {state.message && (
            <p role="alert" className="mt-4 text-sm text-[#9b493c]">
              {state.message}
            </p>
          )}
          <Link
            href="/"
            className="mt-6 block text-center text-sm text-[#6f7973] hover:text-[#173b35]"
          >
            Return to the public site
          </Link>
        </form>
      </div>
    </main>
  );
}
