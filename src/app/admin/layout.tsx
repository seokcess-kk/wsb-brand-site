import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "../globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin · WSB",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full bg-canvas text-structural antialiased">
        {children}
      </body>
    </html>
  );
}
