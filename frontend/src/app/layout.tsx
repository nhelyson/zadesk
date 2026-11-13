import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { PWAProvider } from "@/components/pwa/PWAProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  // Deux valeurs : claire pour le mode clair (body #F8FAFC), sombre pour le mode sombre
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0D1B3D" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  // Fait réduire la zone de mise en page (layout viewport) quand le clavier Android s'ouvre
  // Résultat : 100dvh et les zones de saisie en bas restent visibles avec le clavier ouvert
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: "Zadesk — Le Service Après-Vente pensé pour les entreprises",
  description: "Zadesk aide les entreprises à organiser, automatiser et améliorer leur service client grâce à l'IA et une messagerie SAV intégrée.",
  applicationName: "Zadesk",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Zadesk",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/zadesk-icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${outfit.variable} ${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body className="min-h-screen font-sans antialiased bg-[#F8FAFC] text-navy-900 selection:bg-emerald-500 selection:text-white" suppressHydrationWarning>
        <PWAProvider>
          {children}
        </PWAProvider>
      </body>
    </html>
  );
}