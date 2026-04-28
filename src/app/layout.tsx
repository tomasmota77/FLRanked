import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "FLRanked — Battle Producers Worldwide",
  description: "The ultimate real-time beat battle platform for music producers. Create beats, compete, climb ranks.",
  keywords: ["beat battle", "music production", "trap", "FL Studio", "producer", "competition", "ranked"],
  authors: [{ name: "FLRanked" }],
  openGraph: {
    title: "FLRanked — Battle Producers Worldwide",
    description: "The ultimate real-time beat battle platform for music producers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <Providers>
          <div className="gradient-mesh" />
          <div className="grid-bg min-h-screen relative z-10 flex flex-col w-full">
            <Navbar />
            <main className="flex-grow w-full">{children}</main>
            <Footer />
          </div>
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-default)",
                color: "var(--color-text-primary)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
