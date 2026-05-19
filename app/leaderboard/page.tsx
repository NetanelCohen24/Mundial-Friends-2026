import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export const metadata = { title: "לוח דירוג · מונדיאל חברים 2026" };

type LeaderEntry = {
  user_id: string;
  display_name: string | null;
  email: string | null;
  total_points: number;
  predictions_count: number;
  has_pre_predictions: boolean;
};

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // All predictions (including 0-point ones — show all users who predicted)
  const { data: predictions } = await supabase
    .from("predictions")
    .select("user_id, points_earned");

  // All profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, email");

  // Users who submitted pre-tournament predictions
  const { data: prePreds } = await supabase
    .from("pre_tournament_predictions")
    .select("user_id");
  const preSet = new Set((prePreds ?? []).map((p) => p.user_id));

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  // Aggregate by user
  const map = new Map<string, LeaderEntry>();
  for (const row of predictions ?? []) {
    const prof = profileMap.get(row.user_id);
    if (!map.has(row.user_id)) {
      map.set(row.user_id, {
        user_id: row.user_id,
        display_name: prof?.display_name ?? null,
        email: prof?.email ?? null,
        total_points: 0,
        predictions_count: 0,
        has_pre_predictions: preSet.has(row.user_id),
      });
    }
    const entry = map.get(row.user_id)!;
    entry.total_points += row.points_earned ?? 0;
    entry.predictions_count += 1;
  }

  // Also add users who only have pre-tournament predictions (no match predictions yet)
  for (const userId of preSet) {
    if (!map.has(userId)) {
      const prof = profileMap.get(userId);
      if (prof) {
        map.set(userId, {
          user_id: userId,
          display_name: prof.display_name ?? null,
          email: prof.email ?? null,
          total_points: 0,
          predictions_count: 0,
          has_pre_predictions: true,
        });
      }
    }
  }

  const leaderboard = Array.from(map.values()).sort(
    (a, b) => b.total_points - a.total_points || b.predictions_count - a.predictions_count
  );

  const myRank = user ? leaderboard.findIndex((e) => e.user_id === user.id) + 1 : 0;

  function getName(e: LeaderEntry) {
    return e.display_name ?? e.email?.split("@")[0] ?? "אנונימי";
  }

  const [first, second, third, ...rest] = leaderboard;

  return (
    <main className="min-h-screen pitch-stripes">
      <header className="mx-auto px-6 py-6 max-w-6xl flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-11 h-11 rounded-full bg-pitch flex items-center justify-center text-cream text-xl">⚽</div>
          <span className="font-display font-bold text-base sm:text-lg">← לדשבורד</span>
        </Link>
      </header>

      <section className="mx-auto px-6 max-w-3xl pt-6 pb-24">
        <p className="font-body font-bold text-sunset text-xs sm:text-sm tracking-[0.2em] mb-4">
          📊 עדכון חי אחרי כל משחק
        </p>
        <h1 className="font-display font-black text-5xl sm:text-7xl text-pitch-dark mb-3 leading-tight">
          לוח<br />דירוג
        </h1>
        <p className="font-body text-lg text-ink/60 mb-12">
          {leaderboard.length} משתתפים
          {myRank > 0 && ` · אתה במקום ${myRank}`}
        </p>

        {leaderboard.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-pitch/10">
            <p className="font-display font-bold text-3xl text-ink/20 mb-3">0</p>
            <p className="font-body text-ink/40">עוד אין ניחושים — הדירוג יתעדכן אחרי המשחקים הראשונים</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className="flex items-end justify-center gap-3 sm:gap-6 mb-10">
              {second && (
                <PodiumCard entry={second} rank={2} isMe={user?.id === second.user_id} getName={getName} />
              )}
              {first && (
                <PodiumCard entry={first} rank={1} isMe={user?.id === first.user_id} getName={getName} tall />
              )}
              {third && (
                <PodiumCard entry={third} rank={3} isMe={user?.id === third.user_id} getName={getName} />
              )}
            </div>

            {/* Rest */}
            {rest.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl shadow-pitch/10 border border-pitch/10 overflow-hidden">
                {/* Table header */}
                <div className="flex items-center gap-4 px-6 py-3 bg-pitch/5 border-b border-pitch/10 font-body text-xs font-bold text-ink/40 tracking-widest uppercase">
                  <span className="w-8 text-center">#</span>
                  <span className="flex-1">שחקן</span>
                  <span className="w-16 text-center">ניחושים</span>
                  <span className="w-14 text-left">נקודות</span>
                </div>
                <div className="divide-y divide-pitch/5">
                  {rest.map((entry, i) => {
                    const rank = i + 4;
                    const isMe = user?.id === entry.user_id;
                    return (
                      <div
                        key={entry.user_id}
                        className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                          isMe ? "bg-pitch/5" : "hover:bg-pitch/[0.02]"
                        }`}
                      >
                        <span className="font-display font-black text-xl text-ink/25 w-8 text-center flex-shrink-0">{rank}</span>
                        <div className="flex-1 min-w-0">
                          <span className={`font-body text-sm truncate block ${isMe ? "font-bold text-pitch" : ""}`}>
                            {getName(entry)}
                            {isMe && <span className="mr-2 text-xs text-pitch/60">← אתה</span>}
                          </span>
                          {entry.has_pre_predictions && (
                            <span className="font-body text-xs text-sunset/70">✓ תחזיות מקדימות</span>
                          )}
                        </div>
                        <span className="font-body text-xs text-ink/40 w-16 text-center">
                          {entry.predictions_count}
                        </span>
                        <div className="w-14 text-left">
                          <span className="font-display font-black text-xl text-pitch-dark tabular-nums">{entry.total_points}</span>
                          <span className="font-body text-xs text-ink/40 mr-0.5">נק׳</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function PodiumCard({
  entry,
  rank,
  isMe,
  getName,
  tall = false,
}: {
  entry: LeaderEntry;
  rank: number;
  isMe: boolean;
  getName: (e: LeaderEntry) => string;
  tall?: boolean;
}) {
  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const topPadding: Record<number, string> = { 1: "pt-0", 2: "pt-8", 3: "pt-14" };
  const borderColor: Record<number, string> = {
    1: "border-yellow-300",
    2: "border-slate-300",
    3: "border-amber-600/40",
  };

  return (
    <div className={`flex-1 flex flex-col items-center ${topPadding[rank]}`}>
      <div
        className={`w-full bg-white rounded-2xl border-2 shadow-xl p-4 text-center ${borderColor[rank]} ${
          isMe ? "ring-2 ring-pitch ring-offset-2" : ""
        }`}
      >
        <div className="text-3xl mb-2">{medals[rank]}</div>
        <p className="font-body font-bold text-xs text-ink truncate mb-1 max-w-[90px] mx-auto">
          {getName(entry)}
        </p>
        {isMe && <span className="block font-body text-[10px] text-pitch mb-1">אתה</span>}
        <div className="font-display font-black text-2xl sm:text-3xl text-pitch-dark tabular-nums">{entry.total_points}</div>
        <div className="font-body text-xs text-ink/40">נק׳</div>
        {entry.has_pre_predictions && (
          <div className="font-body text-[10px] text-sunset/60 mt-1">✓ מקדימות</div>
        )}
      </div>
    </div>
  );
}
