import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dompet Mahasigma",
  description: "Financial Companion untuk Mahasiswa",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mahasigma",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      {/* Background luar dibuat abu-abu/biru gelap agar kontras dengan aplikasinya */}
      <body className={`${inter.className} bg-[#e2e8f0] dark:bg-[#0f172a] flex justify-center min-h-screen antialiased`}>
        {/* Ini adalah kontainer layar HP-nya */}
        <div className="w-full h-[100dvh] bg-background text-foreground sm:max-w-md sm:mx-auto sm:shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}