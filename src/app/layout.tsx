import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import { AuthProvider } from "@/components/AuthProvider";
import { SplashScreen } from "@/components/SplashScreen";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TAKAR — Asisten Takaran Nutrisi Harian",
    template: "%s | TAKAR",
  },
  applicationName: "TAKAR",
  description:
    "Asisten takaran protein dan kalori deterministik berbasis TKPI untuk makanan rumahan dan warteg Indonesia.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "TAKAR",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "TAKAR",
    title: "TAKAR — Asisten Takaran Nutrisi Harian",
    description:
      "Kalibrasi protein dan kalori makanan lokal Indonesia secara presisi berbasis tabel TKPI.",
    locale: "id_ID",
  },
  twitter: {
    card: "summary",
    title: "TAKAR — Asisten Takaran Nutrisi Harian",
    description:
      "Kalibrasi protein dan kalori makanan lokal Indonesia secara presisi berbasis tabel TKPI.",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#F0FDF4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-dvh bg-[#EBEEF4] font-sans text-ink antialiased">
        <SplashScreen />
        <div className="mx-auto flex min-h-dvh w-full max-w-[460px] flex-col overflow-x-hidden bg-canvas shadow-[0_0_48px_rgb(0,0,0,0.05)]">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  );
}
