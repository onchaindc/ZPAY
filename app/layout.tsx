import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ZAMAPAY",
  description: "Confidential payments on Ethereum powered by Zama FHE.",
  icons: {
    icon: "/zamapay-logo.jpg",
    shortcut: "/zamapay-logo.jpg",
    apple: "/zamapay-logo.jpg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Navbar />
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
