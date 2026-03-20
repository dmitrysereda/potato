import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Potato",
  description: "Social media management for solo marketers and small teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${outfit.variable} ${playfair.variable}`}>
      <body className="h-full antialiased font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
