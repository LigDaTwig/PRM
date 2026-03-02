import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "PRM Network",
  description: "Personal Relationship Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[--background] text-[--foreground] antialiased">
        <header className="border-b border-[--border] bg-white px-6 py-3 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center">
            <a href="/" className="text-lg font-bold text-[--primary]">
              PRM Network
            </a>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-6">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
