import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// PWA এর জন্য Viewport কনফিগ
export const viewport: Viewport = {
  themeColor: "#dc2626",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "BFC Restaurant App",
  description: "Experience the best fried chicken in Sihanoukville.",
  manifest: "/manifest.json", // manifest লিংক
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BFC Restaurant",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}