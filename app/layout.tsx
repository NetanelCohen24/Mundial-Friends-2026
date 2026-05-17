import type { Metadata } from "next";
import { Rubik, Heebo } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-rubik",
  display: "swap",
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "מונדיאל חברים 2026",
  description:
    "אפליקציית ניחושי תוצאות לקבוצת חברים עבור FIFA World Cup 2026 - 104 משחקים, תחזיות אלוף, ולוח דירוג חי.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} ${heebo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
