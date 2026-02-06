import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Daily Word Chain - Free Online Word Puzzle Game with Timer",
  description: "Play Daily Word Chain, a free 60-second word association puzzle game. Chain words together, beat the timer, and share your score. New challenge every day!",
  keywords: ["word game", "word puzzle", "word chain", "daily puzzle", "word association", "brain game", "vocabulary game"],
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
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
