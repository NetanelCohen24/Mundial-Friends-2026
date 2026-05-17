"use client";

import { useEffect, useState } from "react";

const TOURNAMENT_START = new Date("2026-06-11T22:00:00+03:00").getTime();

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function getTimeLeft(): TimeLeft {
  const diff = Math.max(0, TOURNAMENT_START - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Home() {
  // Start with null on SSR to avoid hydration mismatch, then populate on mount
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen pitch-stripes">
      {/* Top bar */}
      <header className="mx-auto px-6 py-6 max-w-6xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-pitch flex items-center justify-center text-cream text-xl">
            ⚽
          </div>
          <span className="font-display font-bold text-base sm:text-lg">
            מונדיאל חברים
          </span>
        </div>
        <span className="hidden sm:inline-block text-xs font-body font-medium tracking-widest text-pitch border border-pitch/30 rounded-full px-3 py-1.5">
          WC · 2026
        </span>
      </header>

      {/* Hero */}
      <section className="mx-auto px-6 max-w-6xl pt-8 pb-24">
        <p
          className="font-body font-bold text-sunset text-xs sm:text-sm tracking-[0.2em] mb-5 animate-fade-up delay-100"
        >
          ⚽ FIFA WORLD CUP · USA · CANADA · MEXICO
        </p>

        <h1
          className="font-display font-black leading-[0.95] text-[clamp(3rem,11vw,8.5rem)] text-pitch-dark mb-6 animate-fade-up delay-200"
        >
          מי מנחש
          <br />
          <span className="text-sunset">הכי טוב</span>
          <span className="text-pitch-dark">?</span>
        </h1>

        <p className="font-body text-lg sm:text-2xl text-ink/75 max-w-2xl mb-12 leading-relaxed animate-fade-up delay-300">
          ניחושי תוצאות ל-<span className="font-bold text-pitch-dark">104 משחקים</span>,
          תחזיות אלוף ומלך שערים, ולוח דירוג חי - כל החברים בקבוצה אחת.
        </p>

        {/* Countdown card */}
        <div className="bg-pitch-dark text-cream rounded-3xl p-7 sm:p-10 mb-10 max-w-3xl shadow-2xl shadow-pitch/20 animate-fade-up delay-400">
          <p className="font-body text-xs uppercase tracking-[0.25em] text-cream/60 mb-6">
            ↙ שריקת הפתיחה בעוד
          </p>
          <div className="grid grid-cols-4 gap-3 sm:gap-6">
            <CountBox value={timeLeft?.days ?? 0} label="ימים" />
            <CountBox value={timeLeft?.hours ?? 0} label="שעות" />
            <CountBox value={timeLeft?.minutes ?? 0} label="דקות" />
            <CountBox value={timeLeft?.seconds ?? 0} label="שניות" />
          </div>
          <div className="mt-7 pt-5 border-t border-cream/10 flex items-center justify-between gap-4 text-sm font-body text-cream/70">
            <span>11 ביוני 2026</span>
            <span>אצטדיון אצטקה, מקסיקו סיטי 🇲🇽</span>
          </div>
        </div>

        {/* CTA - disabled until auth is ready */}
        <div className="animate-fade-up delay-500">
          <button
            disabled
            aria-disabled="true"
            className="bg-pitch text-cream font-display font-bold text-base sm:text-lg px-7 sm:px-9 py-4 rounded-full opacity-50 cursor-not-allowed inline-flex items-center gap-3"
          >
            <span>התחבר עם Google</span>
            <span className="text-xs font-body font-medium bg-cream/15 px-2.5 py-1 rounded-full">
              בקרוב
            </span>
          </button>
          <p className="text-sm text-ink/60 mt-4 max-w-md">
            האתר עדיין בבנייה - התחברות תיפתח לפני שריקת הפתיחה. שמרו את הכתובת ✨
          </p>
        </div>
      </section>

      {/* Features section on dark background */}
      <section className="bg-pitch-dark py-20 sm:py-28 grain">
        <div className="mx-auto px-6 max-w-6xl">
          <p className="font-body font-bold text-sunset text-xs sm:text-sm tracking-[0.2em] mb-3">
            איך זה עובד
          </p>
          <h2 className="font-display font-black text-4xl sm:text-6xl text-cream mb-14 leading-tight">
            הכל במקום אחד
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            <FeatureCard
              number="104"
              title="משחקים לנחש"
              text="ניחושי תוצאות מדויקות לכל משחק - ניקוד מדורג לפי דיוק התחזית, כולל בונוס להפתעות."
            />
            <FeatureCard
              number="6"
              title="תחזיות מקדימות"
              text="מי האלוף? מי מלך השערים? תחזיות שמכריעות את המקום הראשון בסוף הטורניר."
            />
            <FeatureCard
              number="∞"
              title="ויכוחים עם חברים"
              text="לוח דירוג חי שמתעדכן אחרי כל משחק. ראו מי באמת מבין בכדורגל, ומי מנחש בעיניים סגורות."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cream py-10 border-t border-pitch/10">
        <div className="mx-auto px-6 max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-ink/60 font-body">
          <p>© 2026 · מונדיאל חברים</p>
          <p>נבנה עם ❤️ לקראת המונדיאל</p>
        </div>
      </footer>
    </main>
  );
}

function CountBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display font-black text-4xl sm:text-6xl text-sunset tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </div>
      <div className="font-body text-[10px] sm:text-xs uppercase tracking-[0.2em] text-cream/55 mt-2 sm:mt-3">
        {label}
      </div>
    </div>
  );
}

function FeatureCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-pitch/40 backdrop-blur border border-cream/10 rounded-3xl p-8 hover:border-sunset/50 transition-colors">
      <div className="font-display font-black text-6xl sm:text-7xl text-sunset mb-3 tabular-nums leading-none">
        {number}
      </div>
      <h3 className="font-display font-bold text-2xl text-cream mb-3">{title}</h3>
      <p className="font-body text-cream/70 leading-relaxed">{text}</p>
    </div>
  );
}
