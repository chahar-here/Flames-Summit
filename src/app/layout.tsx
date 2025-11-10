import type { Metadata } from "next";
import "./globals.css";
import { inter, jetbrainsMono } from './fonts';
import { Toaster } from "sonner";
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
          {children}
                  <Toaster
          position="top-center"
          richColors
          expand
          duration={3000}
        />
      </body>
    </html>
  );
}
