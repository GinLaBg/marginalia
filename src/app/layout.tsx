import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Inter, Lora, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AmbientBackground } from "@/components/ambient-background";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://marginalia.app"),
  title: {
    default: "Marginalia – La plateforme littéraire francophone",
    template: "%s — Marginalia",
  },
  description:
    "Publie tes histoires, lis celles des autres et rejoins une communauté qui prend la littérature au sérieux. Marginalia, la plateforme francophone pour écrire et lire.",
  keywords: [
    "écriture créative",
    "lecture en ligne",
    "histoires francophones",
    "fanfiction",
    "roman",
    "plateforme littéraire",
    "publier des histoires",
  ],
  authors: [{ name: "Marginalia" }],
  creator: "Marginalia",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://marginalia.app",
    siteName: "Marginalia",
    title: "Marginalia – La plateforme littéraire francophone",
    description:
      "Écris, publie et découvre des histoires gratuitement sur Marginalia.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Marginalia – La plateforme littéraire francophone",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marginalia – La plateforme littéraire francophone",
    description: "Écris, publie et découvre des histoires gratuitement.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://marginalia.app",
  },
  verification: {
    google: "BVWGbnJmGkxO-dfeC3sRokHImnfWDhfctmmET7XWrfc",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${lora.variable} ${geistMono.variable} theme-violet`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AmbientBackground />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Analytics />
          <GoogleAnalytics gaId="G-KZPD0H1EL9" />
        </ThemeProvider>
      </body>
    </html>
  );
}
