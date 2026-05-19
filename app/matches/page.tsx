import { createClient } from "@/utils/supabase/server";
import MatchesClient from "./MatchesClient";

export const metadata = {
  title: "משחקים · מונדיאל חברים 2026",
};

export default async function MatchesPage() {
  const supabase = await createClient();

  // Auth (optional — public page)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all matches with teams
  const { data: matches, error } = await supabase
    .from("matches")
    .select(
      `id, kickoff_at, stage, group_letter, venue, home_score, away_score, status,
       home_team:home_team_id(id, name_he, flag_emoji, code),
       away_team:away_team_id(id, name_he, flag_emoji, code)`
    )
    .order("kickoff_at", { ascending: true });

  if (error) console.error("matches fetch error:", error);

  // Fetch this user's predictions (if logged in)
  let predictionMap: Record<
    string,
    { predicted_home: number; predicted_away: number; points_earned: number | null }
  > = {};

  if (user) {
    const { data: preds } = await supabase
      .from("predictions")
      .select("match_id, predicted_home, predicted_away, points_earned")
      .eq("user_id", user.id);

    for (const p of preds ?? []) {
      predictionMap[p.match_id] = p;
    }
  }

  return (
    <MatchesClient
      matches={(matches as any) ?? []}
      predictions={predictionMap}
      userId={user?.id ?? null}
    />
  );
}
