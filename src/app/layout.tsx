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
  metadataBase: new URL('https://bitcoin-flash.network'),
  title: {
    default: "Bitcoin Flash | Premium Flash BTC Protocol",
    template: "%s | Bitcoin Flash",
  },
  description:
    "Generate non-spendable Flash Bitcoin directly to your wallet. Fully compatible with Binance, Coinbase, MetaMask, and Trust Wallet. Instant confirmation on blockchain for visualization and testing.",
  keywords: [
    "Bitcoin Flash",
    "Flash BTC",
    "Crypto Simulation",
    "USDT Flash",
    "Binance Compatible",
    "Coinbase Compatible",
    "Flash Bitcoin Generator",
    "Blockchain Testing",
    "Cryptocurrency Software",
  ],
  authors: [{ name: "Flash Core Team", url: "https://bitcoin-flash.network" }],
  creator: "Flash Core Team",
  publisher: "Bitcoin Flash Protocol",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: ICON_URL,
    shortcut: ICON_URL,
    apple: ICON_URL,
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "Bitcoin Flash - Premium Flash BTC Generator",
    description:
      "The most advanced Flash Bitcoin generator protocol. Supports Binance, Coinbase, and MetaMask visualizations.",
    url: "https://bitcoin-flash.network",
    siteName: "Bitcoin Flash Protocol",
    locale: 'en_US',
    images: [
      {
        url: ICON_URL,
        width: 512,
        height: 512,
        alt: "Bitcoin Flash Logo",
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
    creator: "@bitcoinflash",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes when available
    // google: 'google-site-verification-code',
    // yandex: 'yandex-verification-code',
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Bitcoin Flash',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '500',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '156',
    },
    description:
      'Advanced Flash Bitcoin generator protocol compatible with major cryptocurrency exchanges.',
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${outfit.variable} font-mono antialiased bg-background text-foreground selection:bg-emerald-500/30 selection:text-emerald-200`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}