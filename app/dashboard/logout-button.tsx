"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-body font-medium text-pitch hover:text-pitch-dark px-3 py-2 rounded-lg hover:bg-pitch/5 transition-colors"
    >
      התנתק
    </button>
  );
}
