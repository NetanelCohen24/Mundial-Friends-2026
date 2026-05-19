import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminMatchRow from "./AdminMatchRow";

export const metadata = { title: "אדמין · מונדיאל חברים 2026" };

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Check admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

  // Fetch non-finished matches ordered by kickoff
  const { data: matches } = await supabase
    .from("matches")
    .select(
      `
      id, kickoff_at, stage, group_letter, home_score, away_score, status,
      home_team:home_team_id(name_he, flag_emoji),
      away_team:away_team_id(name_he, flag_emoji)
    `
    )
    .order("kickoff_at", { ascending: true });

  const pending = (matches ?? []).filter((m) => m.status !== "finished");
  const finished = (matches ?? []).filter((m) => m.status === "finished");

  return (
    <main className="min-h-screen pitch-stripes">
      <header className="mx-auto px-6 py-6 max-w-6xl flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-11 h-11 rounded-full bg-pitch flex items-center justify-center text-cream text-xl">
            ⚽
          </div>
          <span className="font-display font-bold text-base sm:text-lg">
            ← לדשבורד
          </span>
        </Link>
        <span className="font-body text-xs font-bold text-sunset bg-sunset/10 px-3 py-1.5 rounded-full tracking-widest">
          ADMIN
        </span>
      </header>

      <section className="mx-auto px-6 max-w-4xl pt-6 pb-24">
        <h1 className="font-display font-black text-5xl sm:text-6xl text-pitch-dark mb-3 leading-tight">
          ניהול משחקים
        </h1>
        <p className="font-body text-ink/50 mb-10">
          {pending.length} ממתינים · {finished.length} הסתיימו
        </p>

        {/* Pending matches */}
        {pending.length > 0 && (
          <div className="space-y-3 mb-14">
            <h2 className="font-display font-bold text-xl text-pitch-dark mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sunset inline-block" />
              ממתינים לתוצאה
            </h2>
            {pending.map((m) => (
              <AdminMatchRow key={m.id} match={m as any} />
            ))}
          </div>
        )}

        {/* Finished matches (collapsed) */}
        {finished.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer font-display font-bold text-lg text-ink/40 hover:text-ink/60 transition-colors mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              הסתיימו ({finished.length})
            </summary>
            <div className="space-y-3 mt-4">
              {finished.map((m) => (
                <AdminMatchRow key={m.id} match={m as any} />
              ))}
            </div>
          </details>
        )}

        {/* SQL reminder */}
        <div className="mt-14 bg-pitch-dark rounded-2xl p-6 text-cream font-body text-sm">
          <p className="font-bold text-sunset mb-2 tracking-wider text-xs uppercase">
            זכור להריץ את ה-Trigger ב-Supabase SQL Editor
          </p>
          <p className="text-cream/60 text-xs leading-relaxed">
            הטריגר מחשב נקודות אוטומטית כשמשחק מסומן כ&quot;סיים&quot;.
            אם עוד לא הרצת — בפרומפט יש את ה-SQL המלא.
          </p>
        </div>
      </section>
    </main>
  );
}
