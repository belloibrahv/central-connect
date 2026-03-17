import "./globals.css";
import type { Metadata } from "next";
import { Sora, Space_Grotesk } from "next/font/google";

const display = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"]
});

const body = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "CentralConnect | Student Accommond8",
  description: "Hostel booking and resident services platform"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-sand text-ink">
        {children}
      </body>
    </html>
  );
}
