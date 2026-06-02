import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const ui = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Daily Word Chain - Free Online Word Puzzle Game with Timer",
  description: "Play Daily Word Chain, a free 60-second word association puzzle game. Chain words together, beat the timer, and share your score. New challenge every day!",
  keywords: ["word game", "word puzzle", "word chain", "daily puzzle", "word association", "brain game", "vocabulary game"],
  verification: {
    google: "KLUWmaJTvSkVldncIo2cPl6KQtr610FUWuZhywdYN5Y",
  },
  openGraph: {
    title: "Daily Word Chain - Free Online Word Puzzle Game",
    description: "Chain words together in 60 seconds. New challenge every day!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Word Chain - Free Online Word Puzzle Game",
    description: "Chain words together in 60 seconds. New challenge every day!",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${ui.variable}`}>
      <body className="bg-paper text-ink font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
