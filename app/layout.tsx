import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppChrome from "@/components/AppChrome";

export const metadata: Metadata = {
  title: "ZAMAPAY",
  description: "Confidential payments on Ethereum powered by Zama FHE.",
  icons: {
    icon: "/zamapay-logo.jpg",
    shortcut: "/zamapay-logo.jpg",
    apple: "/zamapay-logo.jpg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#05070d"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full max-w-[100vw] overflow-x-hidden">
      <body className="w-full max-w-[100vw] overflow-x-hidden font-sans antialiased">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
