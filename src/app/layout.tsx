import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LanguageGate } from "@/components/LanguageGate";
import { SkipLink } from "@/components/SkipLink";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const description =
  "Learn traffic rules by rotating real junctions in 3D, then test yourself on the same scenes. Progress is saved in your browser.";

export const metadata: Metadata = {
  title: { default: "Roadwise | Learn traffic rules in 3D", template: "%s | Roadwise" },
  description,
  openGraph: { title: "Roadwise | Learn traffic rules in 3D", description, type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#000000", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <SkipLink />
        <LanguageGate />
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
