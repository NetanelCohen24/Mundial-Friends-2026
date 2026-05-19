import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import PrePredictForm from "./PrePredictForm";

export const metadata = { title: "תחזיות מקדימות · מונדיאל חברים 2026" };

// Lock date: June 11 2026 22:00 Israel time
const LOCK_DATE = new Date("2026-06-11T19:00:00.000Z"); // UTC = 22:00 IL

export default async function PrePredictionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const isLocked = new Date() >= LOCK_DATE;

  // Fetch all teams (sorted by group then name)
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name_he, flag_emoji, code, group_letter")
    .order("group_letter")
    .order("name_he");

  // Fetch existing prediction
  const { data: existing } = await supabase
    .from("pre_tournament_predictions")
    .select(
      "champion_team_id, runner_up_team_id, semifinalist_1_team_id, semifinalist_2_team_id, top_scorer_name, mvp_name, golden_glove_name"
    )
    .eq("user_id", user.id)
    .single();

  // Helper to find team by id
  const findTeam = (id: string | null) =>
    teams?.find((t) => t.id === id) ?? null;

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
      </header>

      <section className="mx-auto px-6 max-w-3xl pt-6 pb-24">
        <p className="font-body font-bold text-sunset text-xs sm:text-sm tracking-[0.2em] mb-4">
          🏆 לפני שהטורניר מתחיל
        </p>
        <h1 className="font-display font-black text-5xl sm:text-7xl text-pitch-dark mb-3 leading-tight">
          תחזיות<br />מקדימות
        </h1>
        <p className="font-body text-lg text-ink/60 mb-10">
          בחר מי יגיע הכי רחוק — סוגר ב-11 ביוני 2026
        </p>

        {isLocked ? (
          /* Locked view: show existing predictions read-only */
          <div className="space-y-6">
            <div className="bg-sunset/10 border border-sunset/30 rounded-2xl px-6 py-4 font-body text-sm text-sunset font-bold text-center">
              ⏱ הטורניר התחיל — תחזיות נעולות
            </div>

            {existing ? (
              <div className="bg-white rounded-3xl shadow-xl shadow-pitch/10 border border-pitch/10 p-8">
                <p className="font-body text-xs font-bold text-ink/40 tracking-widest uppercase mb-6">
                  התחזיות שלך
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <ReadOnlyRow label="🥇 אלוף" team={findTeam(existing.champion_team_id)} />
                  <ReadOnlyRow label="🥈 סגן אלוף" team={findTeam(existing.runner_up_team_id)} />
                  <ReadOnlyRow label="🏅 חצי גמר 1" team={findTeam(existing.semifinalist_1_team_id)} />
                  <ReadOnlyRow label="🏅 חצי גמר 2" team={findTeam(existing.semifinalist_2_team_id)} />
                </div>
                <div className="mt-6 pt-6 border-t border-pitch/10 grid sm:grid-cols-3 gap-4">
                  <TextRow label="⚽ מלך שערים" value={existing.top_scorer_name} />
                  <TextRow label="🌟 MVP" value={existing.mvp_name} />
                  <TextRow label="🧤 כפפת זהב" value={existing.golden_glove_name} />
                </div>
              </div>
            ) : (
              <div className="bg-white/60 rounded-2xl p-8 border border-dashed border-ink/20 text-center">
                <p className="font-body text-ink/40">לא הגשת תחזיות לפני הסגירה</p>
              </div>
            )}
          </div>
        ) : (
          /* Open: show form */
          <div className="bg-white rounded-3xl shadow-xl shadow-pitch/10 border border-pitch/10 p-8">
            <PrePredictForm
              teams={teams ?? []}
              existing={existing ?? null}
              userId={user.id}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function ReadOnlyRow({
  label,
  team,
}: {
  label: string;
  team: { name_he: string; flag_emoji: string } | null;
}) {
  return (
    <div className="flex items-center gap-3 bg-pitch/5 rounded-xl px-4 py-3">
      <span className="font-body text-xs font-bold text-ink/40 w-28 flex-shrink-0">{label}</span>
      {team ? (
        <span className="font-body font-bold text-sm text-ink">
          {team.flag_emoji} {team.name_he}
        </span>
      ) : (
        <span className="font-body text-sm text-ink/30">—</span>
      )}
    </div>
  );
}

function TextRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="bg-pitch/5 rounded-xl px-4 py-3">
      <p className="font-body text-xs font-bold text-ink/40 mb-1">{label}</p>
      <p className="font-body font-bold text-sm text-ink">{value ?? "—"}</p>
    </div>
  );
}
