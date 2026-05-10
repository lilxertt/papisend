import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PapiSend — Instantly Send Anything Between Devices",
  description: "Scan. Connect. Transfer instantly. The futuristic cross-device file transfer platform.",
  keywords: "file transfer, cross device, QR code, wireless, PapiSend",
  openGraph: {
    title: "PapiSend",
    description: "Instantly send anything between your phone and desktop.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-black text-white font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
