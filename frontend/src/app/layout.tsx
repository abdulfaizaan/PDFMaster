import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontDisplay = Cormorant_Garamond({
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MergeMaster - Free PDF Converter & Editor Online",
  description: "PDF free download, compress PDF, PDF merge, PDF online, PDF to PDF converter, PDF converter Word to PDF. Merge, split, compress, and convert PDFs entirely for free.",
  keywords: ["PDF free download", "PDF converter", "PDF converter free", "Compress PDF", "PDF merge", "PDF online", "PDF to PDF converter", "PDF converter Word to PDF"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
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
