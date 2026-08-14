import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Disziplin-Kontrollpanel",
  description: "Tägliches Kontrollpanel für Fitness, Business, Finanzen und Habits",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#14151a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${plexMono.variable} ${barlowCondensed.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
