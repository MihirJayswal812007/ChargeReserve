import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChargeReserve | Fast EV Charging",
  description: "Find and book your EV charging station effortlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen antialiased selection:bg-primary/30 selection:text-primary flex flex-col`}>
        <Navbar />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: { background: "#111", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" },
          }}
        />
      </body>
    </html>
  );
}
