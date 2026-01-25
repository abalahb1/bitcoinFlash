import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const ICON_URL =
  "https://cdn.thedefiant.io/8ac41dc3-633e-4079-9573-b3dc86739a6d.jpeg";

export const metadata: Metadata = {
  title: "Bitcoin Flash | Premium Flash BTC Protocol",
  description:
    "Generate non-spendable Flash Bitcoin directly to your wallet. Fully compatible with Binance, Coinbase, MetaMask, and Trust Wallet. Instant confirmation on blockchain for visualization and testing.",
  keywords: [
    "Bitcoin Flash",
    "Flash BTC",
    "Crypto Simulation",
    "USDT Flash",
    "Binance Compatible",
    "Coinbase Compatible",
  ],
  authors: [{ name: "Flash Core Team" }],
  icons: {
    icon: ICON_URL,
    shortcut: ICON_URL,
    apple: ICON_URL,
  },
  openGraph: {
    title: "Bitcoin Flash - Premium Flash BTC Generator",
    description:
      "The most advanced Flash Bitcoin generator protocol. Supports Binance, Coinbase, and MetaMask visualizations.",
    url: "https://bitcoin-flash.network",
    siteName: "Bitcoin Flash Protocol",
    images: [
      {
        url: ICON_URL,
        width: 512,
        height: 512,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bitcoin Flash Protocol",
    description:
      "Generate Flash BTC instantly correctly visualized on major exchanges like Binance and Coinbase.",
    images: [ICON_URL],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} font-sans antialiased bg-background text-foreground selection:bg-emerald-500/30 selection:text-emerald-200`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}