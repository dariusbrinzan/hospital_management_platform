import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans as FontSans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";

const ChatBot = dynamic(() => import("@/components/ChatBot").then((mod) => ({ default: mod.ChatBot })), {
  ssr: false,
  loading: () => null,
});

const fontSans = FontSans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "eHealth.ro",
  description:
    "Prima platformă de management spital din România. Gestionare programări, înregistrări pacienți, stock-uri medicamente și multe altele pentru furnizorii de servicii medicale.",
  icons: {
    icon: [
      { url: "/assets/icons/logo-icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" }
    ],
    apple: "/assets/icons/logo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-white font-sans antialiased dark:bg-dark-800 dark:text-dark-100",
          fontSans.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
          <ChatBot />
        </ThemeProvider>
      </body>
    </html>
  );
}
