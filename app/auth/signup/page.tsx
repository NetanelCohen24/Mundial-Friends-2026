"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("הסיסמאות לא תואמות");
      return;
    }
    if (password.length < 6) {
      setError("הסיסמה חייבת להיות לפחות 6 תווים");
      return;
    }
    if (!displayName.trim()) {
      setError("חובה להזין שם");
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: displayName.trim() },
      },
    });

    if (signupError) {
      const msg = signupError.message.toLowerCase();
      setError(
        msg.includes("already")
          ? "אימייל זה כבר רשום — נסה להתחבר"
          : "שגיאה ברישום: " + signupError.message
      );
      setLoading(false);
      return;
    }

    // If no session (email confirmation required), tell the user
    if (!data.session) {
      setError("בדוק שב-Supabase כיבית את אישור האימייל (Confirm email: OFF)");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen pitch-stripes flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-3 mb-10 hover:opacity-80 transition-opacity"
        >
          <div className="w-11 h-11 rounded-full bg-pitch flex items-center justify-center text-cream text-xl">
            ⚽
          </div>
          <span className="font-display font-bold text-lg">מונדיאל חברים</span>
        </Link>

        <h1 className="font-display font-black text-5xl sm:text-6xl text-pitch-dark mb-4 leading-tight">
          הצטרף <span className="text-sunset">למשחק</span>
        </h1>
        <p className="font-body text-lg text-ink/70 mb-10">
          צור חשבון ותתחיל לנחש תוצאות.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-7 sm:p-8 shadow-2xl shadow-pitch/15 space-y-5"
        >
          <div>
            <label className="block font-body font-medium text-sm text-ink/80 mb-2">
              שם תצוגה (יופיע בלוח הדירוג)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="נטנאל"
              required
              dir="rtl"
              autoComplete="name"
              className="w-full px-4 py-3.5 rounded-xl border-2 border-pitch/15 focus:border-pitch focus:outline-none font-body text-base transition-colors"
            />
          </div>

          <div>
            <label className="block font-body font-medium text-sm text-ink/80 mb-2">
              אימייל
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              dir="ltr"
              autoComplete="email"
              className="w-full px-4 py-3.5 rounded-xl border-2 border-pitch/15 focus:border-pitch focus:outline-none font-body text-base transition-colors"
            />
          </div>

          <div>
            <label className="block font-body font-medium text-sm text-ink/80 mb-2">
              סיסמה (לפחות 6 תווים)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
              dir="ltr"
              autoComplete="new-password"
              className="w-full px-4 py-3.5 rounded-xl border-2 border-pitch/15 focus:border-pitch focus:outline-none font-body text-base transition-colors"
            />
          </div>

          <div>
            <label className="block font-body font-medium text-sm text-ink/80 mb-2">
              אמת סיסמה
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••"
              required
              dir="ltr"
              autoComplete="new-password"
              className="w-full px-4 py-3.5 rounded-xl border-2 border-pitch/15 focus:border-pitch focus:outline-none font-body text-base transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 font-body text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sunset text-cream font-display font-bold text-lg py-4 rounded-xl hover:bg-sunset/90 transition-colors disabled:opacity-50"
          >
            {loading ? "נרשם..." : "הירשם"}
          </button>

          <p className="text-center font-body text-sm text-ink/50">
            כבר יש לך חשבון?{" "}
            <Link href="/auth/login" className="text-pitch font-bold hover:underline">
              התחבר כאן →
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
