"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

// ─── Types ───────────────────────────────────────────────
type Team = { id: string; name_he: string; flag_emoji: string; code: string };

type Match = {
  id: string;
  kickoff_at: string;
  stage: string;
  group_letter: string | null;
  venue: string | null;
  home_score: number | null;
  away_score: number | null;
  status: "upcoming" | "live" | "finished";
  home_team: Team;
  away_team: Team;
};

type MyPrediction = {
  predicted_home: number;
  predicted_away: number;
  points_earned: number | null;
};

type FriendPred = {
  user_id: string;
  predicted_home: number;
  predicted_away: number;
  points_earned: number | null;
  name: string;
};

type Props = {
  matches: Match[];
  predictions: Record<string, MyPrediction>;
  userId: string | null;
};

// ─── Constants ───────────────────────────────────────────
const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const STAGE_LABELS: Record<string, string> = {
  group: "שלב הבתים",
  r32: "שמינית גמר",
  r16: "שישית עשרה",
  qf: "רבע גמר",
  sf: "חצי גמר",
  third_place: "משחק שלישי",
  final: "גמר",
};

const FIFA_TO_ISO2: Record<string, string> = {
  MEX:"MX",USA:"US",CAN:"CA",ARG:"AR",BRA:"BR",FRA:"FR",GER:"DE",ESP:"ES",
  POR:"PT",NED:"NL",BEL:"BE",ITA:"IT",CRO:"HR",URU:"UY",COL:"CO",CHI:"CL",
  ENG:"GB",WAL:"GB",SCO:"GB",NGA:"NG",SEN:"SN",GHA:"GH",CMR:"CM",MAR:"MA",
  TUN:"TN",EGY:"EG",ALG:"DZ",RSA:"ZA",JPN:"JP",KOR:"KR",IRN:"IR",SAU:"SA",
  AUS:"AU",QAT:"QA",IRQ:"IQ",SUI:"CH",AUT:"AT",POL:"PL",SWE:"SE",DEN:"DK",
  NOR:"NO",ROU:"RO",SRB:"RS",GRE:"GR",TUR:"TR",UKR:"UA",ISL:"IS",FIN:"FI",
  CRC:"CR",HON:"HN",GUA:"GT",PAN:"PA",JAM:"JM",TRI:"TT",SLV:"SV",HAI:"HT",
  VEN:"VE",ECU:"EC",PAR:"PY",BOL:"BO",NZL:"NZ",KWT:"KW",UAE:"AE",JOR:"JO",
  MLI:"ML",CIV:"CI",ETH:"ET",KEN:"KE",COD:"CD",MOZ:"MZ",ZAM:"ZM",ZIM:"ZW",
  LBA:"LY",SUD:"SD",SOM:"SO",KSA:"SA",CHN:"CN",RUS:"RU",HUN:"HU",SVK:"SK",
  CZE:"CZ",BUL:"BG",MNE:"ME",BIH:"BA",MKD:"MK",GEO:"GE",ARM:"AM",AZE:"AZ",
  ISR:"IL",PLE:"PS",SYR:"SY",LBN:"LB",YEM:"YE",PHI:"PH",THA:"TH",VIE:"VN",
  IDN:"ID",IND:"IN",NCA:"NI",BLZ:"BZ",DOM:"DO",CUB:"CU",VAN:"VU",FIJ:"FJ",
  PNG:"PG",TAH:"PF",NCL:"NC",NMI:"MP",
};

/** Convert DB flag_emoji (which might be a code like "MX") to real emoji */
function getFlag(flagEmoji: string, code: string): string {
  if (flagEmoji && [...flagEmoji].some((c) => c.codePointAt(0)! > 127)) {
    return flagEmoji; // Already a real emoji
  }
  const raw = (flagEmoji?.trim() || code?.trim() || "").toUpperCase();
  const iso2 = raw.length === 2 ? raw : (FIFA_TO_ISO2[raw] ?? raw.substring(0, 2));
  if (iso2.length === 2 && /^[A-Z]{2}$/.test(iso2)) {
    return iso2.split("").map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397)).join("");
  }
  return "🏳️";
}

function formatDateHe(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("he-IL", {
    timeZone: "Asia/Jerusalem",
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTimeHe(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("he-IL", {
    timeZone: "Asia/Jerusalem",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDateKey(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
}

// ─── Main ─────────────────────────────────────────────────
export default function MatchesClient({ matches, predictions, userId }: Props) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!activeGroup) return matches;
    return matches.filter((m) => m.group_letter === activeGroup);
  }, [matches, activeGroup]);

  const grouped = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const match of filtered) {
      const key = getDateKey(match.kickoff_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(match);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <main className="min-h-screen pitch-stripes">
      <header className="mx-auto px-6 py-6 max-w-6xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-11 h-11 rounded-full bg-pitch flex items-center justify-center text-cream text-xl">⚽</div>
          <span className="font-display font-bold text-base sm:text-lg">מונדיאל חברים</span>
        </Link>
        <Link href="/dashboard" className="font-body text-sm font-medium text-pitch hover:text-pitch-dark transition-colors">
          → לדשבורד
        </Link>
      </header>

      <section className="mx-auto px-6 max-w-6xl pt-8 pb-24">
        <p className="font-body font-bold text-sunset text-xs sm:text-sm tracking-[0.2em] mb-4">⚽ FIFA WORLD CUP · 2026</p>
        <h1 className="font-display font-black text-5xl sm:text-7xl text-pitch-dark mb-3 leading-tight">כל המשחקים</h1>
        <p className="font-body text-lg text-ink/60 mb-10">{matches.length} משחקים · לחץ על בית לסינון</p>

        {/* Group chips */}
        <div className="flex flex-wrap gap-2 mb-12">
          <button
            onClick={() => setActiveGroup(null)}
            className={`px-4 py-2 rounded-full font-body font-bold text-sm transition-colors ${
              !activeGroup ? "bg-pitch text-cream shadow-lg shadow-pitch/20" : "bg-pitch/10 text-pitch hover:bg-pitch/20"
            }`}
          >
            הכל
          </button>
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(activeGroup === g ? null : g)}
              className={`px-4 py-2 rounded-full font-body font-bold text-sm transition-colors ${
                activeGroup === g ? "bg-pitch text-cream shadow-lg shadow-pitch/20" : "bg-pitch/10 text-pitch hover:bg-pitch/20"
              }`}
            >
              בית {g}
            </button>
          ))}
        </div>

        {/* Matches grouped by date */}
        <div className="space-y-12">
          {grouped.map(([dateKey, dayMatches]) => (
            <div key={dateKey}>
              <h2 className="font-display font-bold text-xl text-pitch-dark mb-5 pb-3 border-b-2 border-pitch/10 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-sunset inline-block" />
                {formatDateHe(dayMatches[0].kickoff_at)}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dayMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    myPrediction={predictions[match.id] ?? null}
                    userId={userId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {grouped.length === 0 && (
          <div className="text-center py-24 text-ink/40 font-body text-lg">אין משחקים בבית זה</div>
        )}
      </section>
    </main>
  );
}

// ─── Match Card ───────────────────────────────────────────
function MatchCard({
  match,
  myPrediction,
  userId,
}: {
  match: Match;
  myPrediction: MyPrediction | null;
  userId: string | null;
}) {
  const isPast = new Date(match.kickoff_at) < new Date();
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";
  const locked = isPast || isLive || isFinished;

  const [home, setHome] = useState(myPrediction?.predicted_home ?? 0);
  const [away, setAway] = useState(myPrediction?.predicted_away ?? 0);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");

  const [showFriends, setShowFriends] = useState(false);
  const [friendPreds, setFriendPreds] = useState<FriendPred[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const friendsLoaded = useRef(false);

  const stageLabel = match.group_letter ? `בית ${match.group_letter}` : (STAGE_LABELS[match.stage] ?? match.stage);
  const homeFlag = getFlag(match.home_team.flag_emoji, match.home_team.code);
  const awayFlag = getFlag(match.away_team.flag_emoji, match.away_team.code);

  async function save() {
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("predictions").upsert(
      { user_id: userId, match_id: match.id, predicted_home: home, predicted_away: away },
      { onConflict: "user_id,match_id" }
    );
    setSaving(false);
    setSaveState(error ? "error" : "saved");
    if (!error) setTimeout(() => setSaveState("idle"), 2500);
  }

  async function toggleFriends() {
    setShowFriends((v) => !v);
    if (friendsLoaded.current) return;
    setLoadingFriends(true);

    const supabase = createClient();
    const { data: preds } = await supabase
      .from("predictions")
      .select("user_id, predicted_home, predicted_away, points_earned")
      .eq("match_id", match.id)
      .order("points_earned", { ascending: false, nullsFirst: false });

    if (preds && preds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, email")
        .in("id", preds.map((p) => p.user_id));
      const pm = new Map((profiles ?? []).map((p) => [p.id, p]));
      setFriendPreds(
        preds.map((p) => {
          const prof = pm.get(p.user_id);
          return { ...p, name: prof?.display_name ?? prof?.email?.split("@")[0] ?? "אנונימי" };
        })
      );
    }

    setLoadingFriends(false);
    friendsLoaded.current = true;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-pitch/10 border border-pitch/5 overflow-hidden hover:border-pitch/15 transition-all flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-pitch-dark/[0.04] border-b border-black/5">
        <span className="font-body text-xs font-bold text-pitch tracking-wider uppercase">{stageLabel}</span>
        {isLive ? (
          <span className="font-body text-xs font-bold text-red-500 animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />חי
          </span>
        ) : isFinished ? (
          <span className="font-body text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">סיים</span>
        ) : (
          <span className="font-body text-xs text-ink/45">{formatTimeHe(match.kickoff_at)}</span>
        )}
      </div>

      {/* Teams */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-5xl leading-none">{homeFlag}</span>
            <span className="font-body font-bold text-xs text-ink text-center leading-tight">{match.home_team.name_he}</span>
          </div>

          {isFinished ? (
            <div className="flex items-center gap-1.5 flex-shrink-0 bg-pitch-dark rounded-xl px-3 py-2">
              <span className="font-display font-black text-3xl text-cream tabular-nums">{match.home_score}</span>
              <span className="font-display font-bold text-xl text-cream/40">:</span>
              <span className="font-display font-black text-3xl text-cream tabular-nums">{match.away_score}</span>
            </div>
          ) : isLive ? (
            <div className="flex items-center gap-1.5 flex-shrink-0 bg-red-500 rounded-xl px-3 py-2">
              <span className="font-display font-black text-2xl text-white tabular-nums">{match.home_score ?? "?"}</span>
              <span className="font-display font-bold text-lg text-white/60">:</span>
              <span className="font-display font-black text-2xl text-white tabular-nums">{match.away_score ?? "?"}</span>
            </div>
          ) : (
            <span className="font-body text-xs font-bold text-ink/20 tracking-widest flex-shrink-0">VS</span>
          )}

          <div className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-5xl leading-none">{awayFlag}</span>
            <span className="font-body font-bold text-xs text-ink text-center leading-tight">{match.away_team.name_he}</span>
          </div>
        </div>
      </div>

      {/* Prediction area */}
      <div className="px-4 pb-4 pt-3 border-t border-black/5 mt-auto">
        {!locked ? (
          userId ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 flex-1">
                <input
                  type="number" min={0} max={20} value={home} placeholder="0"
                  onChange={(e) => setHome(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
                  className="w-12 h-10 text-center font-display font-black text-xl border-2 border-pitch/20 rounded-lg focus:border-pitch focus:outline-none transition"
                />
                <span className="font-display font-black text-lg text-ink/30 px-0.5">:</span>
                <input
                  type="number" min={0} max={20} value={away} placeholder="0"
                  onChange={(e) => setAway(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
                  className="w-12 h-10 text-center font-display font-black text-xl border-2 border-pitch/20 rounded-lg focus:border-pitch focus:outline-none transition"
                />
              </div>
              <button
                onClick={save}
                disabled={saving}
                className={`flex-shrink-0 px-3 py-2 rounded-full font-body font-bold text-xs transition-colors disabled:opacity-60 ${
                  saveState === "saved" ? "bg-green-100 text-green-700"
                  : saveState === "error" ? "bg-red-100 text-red-600"
                  : "bg-pitch text-cream hover:bg-pitch-dark"
                }`}
              >
                {saving ? "..." : saveState === "saved" ? "✓ נשמר" : saveState === "error" ? "שגיאה" : myPrediction ? "✓ עדכן" : "💾 שמור"}
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="block w-full text-center font-body font-bold text-xs py-2.5 rounded-full border border-pitch/30 text-pitch hover:bg-pitch hover:text-cream transition-colors"
            >
              התחבר כדי לנחש
            </Link>
          )
        ) : (
          <div className="space-y-2">
            {myPrediction ? (
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-ink/50">הניחוש שלי:</span>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-lg text-pitch-dark tabular-nums">
                    {myPrediction.predicted_home}:{myPrediction.predicted_away}
                  </span>
                  {isFinished && myPrediction.points_earned !== null && (
                    <PointsPill points={myPrediction.points_earned} />
                  )}
                </div>
              </div>
            ) : (
              <p className="font-body text-xs text-ink/40 text-center">פספסת את המשחק 😢</p>
            )}
            <button
              onClick={toggleFriends}
              className="w-full text-center font-body text-xs font-bold text-pitch/50 hover:text-pitch transition-colors py-0.5"
            >
              {showFriends ? "▴ הסתר" : "👥 ניחושי החברים"}
            </button>
          </div>
        )}
      </div>

      {/* Friends panel */}
      {showFriends && (
        <div className="border-t border-black/5 px-4 py-3 bg-pitch/[0.02]">
          {loadingFriends ? (
            <p className="text-center py-2 font-body text-xs text-ink/40 animate-pulse">טוען...</p>
          ) : friendPreds.length === 0 ? (
            <p className="text-center py-2 font-body text-xs text-ink/40">אין ניחושים עדיין</p>
          ) : (
            <div className="space-y-1.5">
              {friendPreds.map((fp, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between text-xs font-body rounded-lg px-2 py-1.5 ${
                    isFinished && fp.points_earned === 10 ? "bg-green-50 text-green-800 font-bold" : "text-ink/70"
                  }`}
                >
                  <span className="truncate max-w-[110px]">{fp.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-display font-bold">{fp.predicted_home}:{fp.predicted_away}</span>
                    {isFinished && fp.points_earned !== null && (
                      <span className="font-bold text-pitch">{fp.points_earned}נק׳</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PointsPill({ points }: { points: number }) {
  const style =
    points === 10 ? "bg-green-100 text-green-700"
    : points === 5 ? "bg-blue-100 text-blue-700"
    : points === 3 ? "bg-yellow-100 text-yellow-700"
    : "bg-red-50 text-red-400";
  return <span className={`font-body font-bold text-xs px-2 py-0.5 rounded-full ${style}`}>{points}נק׳</span>;
}
