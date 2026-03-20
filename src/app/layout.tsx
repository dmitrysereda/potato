export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className={`h-full ${outfit.variable} ${playfair.variable}`}>
      <body className="h-full flex antialiased font-sans">
        {user && <Sidebar />}
        <main className="flex-1 overflow-y-auto bg-background h-full">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
