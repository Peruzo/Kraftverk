import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnimatedBackground from "@/components/effects/AnimatedBackground";
import ScrollProgress from "@/components/effects/ScrollProgress";
import AnalyticsProvider from "@/components/providers/AnalyticsProvider";

export const metadata: Metadata = {
  title: "Kraftverk Studio — Träna smart. Känn dig hemma.",
  description:
    "Premium-funktionellt gym för urbana 20–45-åringar som vill ha tydlig progression, mysigt community och noll prestige.",
  keywords: ["gym", "träning", "fitness", "Stockholm", "personlig träning", "klasser"],
  icons: [
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <AnalyticsProvider>
          <ScrollProgress />
          <AnimatedBackground />
          <Header />
          <main className="site-main">
            {children}
          </main>
          <Footer />
        </AnalyticsProvider>
      </body>
    </html>
  );
}

