import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "TAKAR — Kalibrasi Makro & Protein Makanan Lokal",
  description:
    "Pelacak protein dan kalori deterministik berbasis TKPI untuk makanan rumahan dan warteg Indonesia.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F6F8FB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-dvh bg-[#EBEEF4] font-sans text-ink antialiased">
        <div className="mx-auto flex min-h-dvh w-full max-w-[460px] flex-col overflow-x-hidden bg-canvas shadow-[0_0_48px_rgb(0,0,0,0.05)]">
          {children}
        </div>
      </body>
    </html>
  );
}
