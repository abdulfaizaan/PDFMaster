import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";

import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Free PDF Editor - Merge, Convert & Compress PDF Documents",
  description: "The ultimate free pdf editor and pdf converter. Convert pdf to word, jpg to pdf, compress pdf, and merge pdf easily.",
  keywords: [
    "PDF Editor",
    "pdf editor",
    "pdf to word",
    "jpg to pdf",
    "pdf converter",
    "i love pdf",
    "pdf to jpg",
    "pdf combiner",
    "pdf to to wordm",
    "combine pdf",
    "free pdf editor",
    "convert pdf to word",
    "png to pdf",
    "pdf compressor",
    "compress pdf",
    "merge pdf"
  ],
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "Free PDF Editor - Merge, Convert & Compress PDF",
    description: "The ultimate free pdf editor and pdf converter. Convert pdf to word, jpg to pdf, compress pdf, and merge pdf easily.",
    type: "website",
    siteName: "MergeMaster",
  },
  other: {
    "google-adsense-account": "ca-pub-6776374477036348",
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
      className={`h-full antialiased ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6776374477036348"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XBTWF24NVS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-XBTWF24NVS');
          `}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Header />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}