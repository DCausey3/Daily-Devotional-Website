import { NextResponse, type NextRequest } from "next/server";
import { isLocalPreview } from "@/lib/local-preview";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    if (isLocalPreview()) return NextResponse.next({ request });
    throw new Error(
      "Supabase is not configured. Add its URL and publishable key to your environment.",
    );
  }

  const { supabase, supabaseResponse } = createClient(request);
  await supabase.auth.getUser();
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
