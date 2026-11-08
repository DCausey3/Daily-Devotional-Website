import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/admin/login");

  const { data: isAdmin, error: roleError } = await supabase.rpc("is_admin");
  if (roleError) throw new Error(`Could not verify admin access: ${roleError.message}`);
  if (!isAdmin) redirect("/admin/login?error=not-admin");

  return supabase;
}
