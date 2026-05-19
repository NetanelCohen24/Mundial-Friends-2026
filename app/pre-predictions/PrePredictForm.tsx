"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Team = { id: string; name_he: string; flag_emoji: string; code: string };

type Existing = {
  champion_team_id: string | null;
  runner_up_team_id: string | null;
  semifinalist_1_team_id: string | null;
  semifinalist_2_team_id: string | null;
  top_scorer_name: string | null;
  mvp_name: string | null;
  golden_glove_name: string | null;
};

type Props = {
  teams: Team[];
  existing: Existing | null;
  userId: string;
};

export default function PrePredictForm({ teams, existing, userId }: Props) {
  const router = useRouter();
  const [champion, setChampion] = useState(existing?.champion_team_id ?? "");
  const [runnerUp, setRunnerUp] = useState(existing?.runner_up_team_id ?? "");
  const [semi1, setSemi1] = useState(existing?.semifinalist_1_team_id ?? "");
  const [semi2, setSemi2] = useState(existing?.semifinalist_2_team_id ?? "");
  const [topScorer, setTopScorer] = useState(existing?.top_scorer_name ?? "");
  const [mvp, setMvp] = useState(existing?.mvp_name ?? "");
  const [goldenGlove, setGoldenGlove] = useState(existing?.golden_glove_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { error: upsertError } = await supabase
      .from("pre_tournament_predictions")
      .upsert(
        {
          user_id: userId,
          champion_team_id: champion || null,
          runner_up_team_id: runnerUp || null,
          semifinalist_1_team_id: semi1 || null,
          semifinalist_2_team_id: semi2 || null,
          top_scorer_name: topScorer || null,
          mvp_name: mvp || null,
          golden_glove_name: goldenGlove || null,
        },
        { onConflict: "user_id" }
      );

    setSaving(false);
    if (upsertError) {
      setError("שגיאה בשמירה: " + upsertError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      {/* Team dropdowns */}
      <div className="grid sm:grid-cols-2 gap-5">
        <TeamSelect
          label="🥇 אלוף"
          value={champion}
          onChange={setChampion}
          teams={teams}
        />
        <TeamSelect
          label="🥈 סגן אלוף"
          value={runnerUp}
          onChange={setRunnerUp}
          teams={teams}
        />
        <TeamSelect
          label="🏅 חצי גמר 1"
          value={semi1}
          onChange={setSemi1}
          teams={teams}
        />
        <TeamSelect
          label="🏅 חצי גמר 2"
          value={semi2}
          onChange={setSemi2}
          teams={teams}
        />
      </div>

      {/* Text inputs */}
      <div className="grid sm:grid-cols-3 gap-5">
        <TextInput
          label="⚽ מלך שערים"
          placeholder="שם השחקן"
          value={topScorer}
          onChange={setTopScorer}
        />
        <TextInput
          label="🌟 מצטיין הטורניר (MVP)"
          placeholder="שם השחקן"
          value={mvp}
          onChange={setMvp}
        />
        <TextInput
          label="🧤 כפפת הזהב (שוער)"
          placeholder="שם השחקן"
          value={goldenGlove}
          onChange={setGoldenGlove}
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm font-body text-center">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-full bg-sunset text-cream font-display font-bold text-lg hover:bg-sunset/90 transition-colors disabled:opacity-60"
      >
        {saving ? "שומר..." : saved ? "✓ נשמר!" : existing ? "עדכן תחזיות" : "שמור תחזיות"}
      </button>

      <p className="font-body text-xs text-ink/40 text-center">
        ניתן לעדכן עד 11 ביוני 2026, 22:00
      </p>
    </div>
  );
}

function TeamSelect({
  label,
  value,
  onChange,
  teams,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  teams: Team[];
}) {
  const selected = teams.find((t) => t.id === value);
  return (
    <div>
      <label className="font-body text-sm font-bold text-ink/60 mb-2 block">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-pitch/20 rounded-xl px-4 py-3 font-body text-sm text-ink focus:outline-none focus:border-pitch focus:ring-2 focus:ring-pitch/20 transition pr-10"
          dir="rtl"
        >
          <option value="">— בחר קבוצה —</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.flag_emoji} {t.name_he}
            </option>
          ))}
        </select>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink/30">
          ▾
        </span>
        {selected && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xl">
            {selected.flag_emoji}
          </span>
        )}
      </div>
    </div>
  );
}

function TextInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="font-body text-sm font-bold text-ink/60 mb-2 block">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-pitch/20 rounded-xl px-4 py-3 font-body text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-pitch focus:ring-2 focus:ring-pitch/20 transition"
        dir="rtl"
      />
    </div>
  );
}
