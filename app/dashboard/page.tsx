import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email, is_admin")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.display_name ?? user.email?.split("@")[0] ?? "חבר";
  const isAdmin = profile?.is_admin ?? false;

  return (
    <main className="min-h-screen pitch-stripes">
      <header className="mx-auto px-6 py-6 max-w-6xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-11 h-11 rounded-full bg-pitch flex items-center justify-center text-cream text-xl">
            ⚽
          </div>
          <span className="font-display font-bold text-base sm:text-lg">
            מונדיאל חברים
          </span>
        </Link>
        <LogoutButton />
      </header>

      <section className="mx-auto px-6 max-w-6xl pt-12 pb-24">
        <p className="font-body font-bold text-sunset text-xs sm:text-sm tracking-[0.2em] mb-5">
          ✓ מחובר
        </p>
        <h1 className="font-display font-black leading-[0.95] text-5xl sm:text-7xl text-pitch-dark mb-6">
          ברוך הבא,
          <br />
          <span className="text-sunset">{displayName}</span>
        </h1>
        <p className="font-body text-lg sm:text-xl text-ink/70 max-w-2xl mb-14 leading-relaxed">
          נחש תוצאות, בחר את האלוף שלך, ותראה איפה אתה בדירוג.
        </p>

        <div className={`grid gap-5 ${isAdmin ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
          <ActiveCard href="/matches" icon="⚽" title="ניחושי משחקים" text="טופס לכל משחק, סגירה אוטומטית בשריקת הפתיחה." />
          <ActiveCard href="/pre-predictions" icon="🏆" title="תחזיות מקדימות" text="אלוף, מלך שערים, מצטיין הטורניר." />
          <ActiveCard href="/leaderboard" icon="📊" title="לוח דירוג חי" text="עדכון אחרי כל משחק. ראו מי באמת מבין." />
          {isAdmin && (
            <ActiveCard href="/admin" icon="⚙️" title="ניהול אדמין" text="הזן תוצאות משחקים וסמן כסיום." adminBadge />
          )}
        </div>
      </section>
    </main>
  );
}

function ActiveCard({
  href,
  icon,
  title,
  text,
  adminBadge = false,
}: {
  href: string;
  icon: string;
  title: string;
  text: string;
  adminBadge?: boolean;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl p-7 shadow-xl shadow-pitch/10 border border-pitch/20 hover:border-sunset/40 hover:shadow-2xl transition-all group"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-display font-bold text-xl text-pitch-dark mb-2">
        {title}
      </h3>
      <p className="font-body text-sm text-ink/60 mb-4 leading-relaxed">{text}</p>
      <span className={`inline-block text-xs font-body font-bold tracking-widest text-cream px-2.5 py-1 rounded-full group-hover:opacity-80 transition-colors ${adminBadge ? "bg-sunset" : "bg-pitch"}`}>
        כנס →
      </span>
    </Link>
  );
}
