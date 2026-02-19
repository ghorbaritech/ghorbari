import type { Metadata } from "next";
import { DM_Sans, Hind_Siliguri } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ghorbari - Design & Construction Marketplace",
  description: "Full-stack architectural design and construction marketplace.",
  icons: {
    icon: "/favicon.svg",
  },
};

import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";

import { CompareProvider } from "@/context/CompareContext";
import { CompareStickyBar } from "@/components/ui/CompareStickyBar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${hindSiliguri.variable} antialiased font-sans`}
      >
        <LanguageProvider>
          <CartProvider>
            <CompareProvider>
              {children}
              <Toaster />
              <CompareStickyBar />
              <SonnerToaster />
            </CompareProvider>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
