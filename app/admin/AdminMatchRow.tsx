"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Team = { name_he: string; flag_emoji: string };

type Match = {
  id: string;
  kickoff_at: string;
  stage: string;
  group_letter: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string;
  home_team: Team;
  away_team: Team;
};

export default function AdminMatchRow({ match }: { match: Match }) {
  const [homeScore, setHomeScore] = useState<string>(
    match.home_score !== null ? String(match.home_score) : ""
  );
  const [awayScore, setAwayScore] = useState<string>(
    match.away_score !== null ? String(match.away_score) : ""
  );
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(match.status === "finished");
  const [error, setError] = useState<string | null>(null);

  async function handleFinish() {
    if (homeScore === "" || awayScore === "") {
      setError("חובה למלא שני תוצאות");
      return;
    }
    const h = parseInt(homeScore);
    const a = parseInt(awayScore);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setError("מספרים תקינים בלבד");
      return;
    }

    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("matches")
      .update({ home_score: h, away_score: a, status: "finished" })
      .eq("id", match.id);

    setSaving(false);
    if (updateError) {
      setError("שגיאה: " + updateError.message);
    } else {
      setDone(true);
    }
  }

  const label = match.group_letter
    ? `בית ${match.group_letter}`
    : match.stage;

  const kickoff = new Date(match.kickoff_at).toLocaleString("he-IL", {
    timeZone: "Asia/Jerusalem",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${
        done ? "border-green-200 opacity-60" : "border-pitch/10"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Match info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-body text-xs font-bold text-pitch bg-pitch/10 px-2 py-0.5 rounded-full">
              {label}
            </span>
            <span className="font-body text-xs text-ink/40">{kickoff}</span>
          </div>
          <div className="flex items-center gap-2 font-body font-bold text-sm text-ink">
            <span>{match.home_team.flag_emoji} {match.home_team.name_he}</span>
            <span className="text-ink/25">נגד</span>
            <span>{match.away_team.flag_emoji} {match.away_team.name_he}</span>
          </div>
        </div>

        {/* Score inputs + button */}
        {done ? (
          <div className="flex items-center gap-2 font-display font-black text-2xl text-green-700">
            <span>{homeScore}</span>
            <span className="text-green-300">:</span>
            <span>{awayScore}</span>
            <span className="font-body text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full mr-2">✓ סיים</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-shrink-0">
            <input
              type="number"
              min={0}
              max={20}
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              placeholder="0"
              className="w-14 h-12 text-center font-display font-black text-xl border-2 border-pitch/20 rounded-xl focus:border-pitch focus:outline-none"
            />
            <span className="font-display font-black text-xl text-ink/30">:</span>
            <input
              type="number"
              min={0}
              max={20}
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              placeholder="0"
              className="w-14 h-12 text-center font-display font-black text-xl border-2 border-pitch/20 rounded-xl focus:border-pitch focus:outline-none"
            />
            <button
              onClick={handleFinish}
              disabled={saving}
              className="px-4 py-2.5 rounded-full bg-pitch text-cream font-body font-bold text-sm hover:bg-pitch-dark transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {saving ? "..." : "סמן סיום"}
            </button>
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs font-body mt-2">{error}</p>
      )}
    </div>
  );
}
