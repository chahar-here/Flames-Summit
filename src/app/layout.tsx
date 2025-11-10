import type { Metadata } from "next";
import "./globals.css";
import { inter, jetbrainsMono } from './fonts';

export const metadata: Metadata = {
  title: "Flames Summit",
  description: "Flames Summit - Startup Mahakumbh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
          {children}
      </body>
    </html>
  );
}
