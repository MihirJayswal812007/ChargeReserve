import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChargeReserve | Fast EV Charging",
  description: "Find and book your EV charging station effortlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased selection:bg-primary/30 selection:text-primary flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Toaster
            position="top-right"
            theme="system"
            toastOptions={{
              className: "dark:bg-[#111] dark:border-white/10 dark:text-white bg-white border-black/10 text-black",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
