import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { Providers } from "@/components/Providers";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { CRAFT_DESCRIPTION } from "@/lib/brand";
import { buildDefaultCraftOpenGraph } from "@/lib/share-metadata";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

export const metadata: Metadata = {
  ...(appUrl ? { metadataBase: new URL(appUrl) } : {}),
  applicationName: "CRAFT",
  title: {
    default: "CRAFT",
    template: "%s · CRAFT",
  },
  description: CRAFT_DESCRIPTION,
  openGraph: buildDefaultCraftOpenGraph(),
  twitter: {
    card: "summary_large_image",
    title: "CRAFT",
    description: CRAFT_DESCRIPTION,
    images: ["/icons/icon-512.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/icons/favicon-32.png", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CRAFT",
    startupImage: [
      {
        url: "/splash/apple-splash-1290-2796.png",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-1170-2532.png",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-750-1334.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050506" },
    { media: "(prefers-color-scheme: light)", color: "#050506" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
