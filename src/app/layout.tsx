import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for premium feel
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "My Strapi Blog",
  description: "A premium blog built with Next.js and Strapi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, "min-h-screen font-sans antialiased flex flex-col")}>
        <Header />
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
          {children}
        </main>
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}
