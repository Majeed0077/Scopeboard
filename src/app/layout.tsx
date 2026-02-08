import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const helveticaNow = localFont({
  variable: "--font-sans",
  src: [
    {
      path: "../../public/fonts/HelveticaNow/HelveticaNowText-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/HelveticaNow/HelveticaNowText-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/HelveticaNow/HelveticaNowText-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  fallback: ["Helvetica", "Arial", "system-ui", "sans-serif"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VaultFlow",
  description: "Internal agency CRM dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${helveticaNow.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
