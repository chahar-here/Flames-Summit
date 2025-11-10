"use client";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { MdAttachMoney, MdDiscount } from "react-icons/md";
import {
  IconBrandTabler,
  IconMailBolt,
  IconMessage,
  IconTicket,
  IconTicketOff,
  IconUser,
  IconUserDollar,
} from "@tabler/icons-react";
import { AuthProvider } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";
import { Inter, JetBrains_Mono } from "next/font/google";
import { useState } from "react";
import Image from "next/image";
import LogoutButton from "@/components/logout/Logout";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});
export default function RootLayout({
    children,}: Readonly<{
        children: React.ReactNode;
}>) {
  const Logo = () => {
  return (
    <a
      href="/Ad_min/signin/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <Image
        src="/flames_white.png"
        alt="Logo"
        width={100}
        height={100}
        />
    </a>
  );
};
  const LogoIcon = () => {
  return (
    <a
      href="/Ad_min/signin/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 bg-cover"
    >
      <Image
        src="/flames_white.png"
        alt="Logo"
        width={100}
        height={100}
        />
    </a>
  );
};

  const links = [
    {
      label: "Dashboard",
      href: "/Ad_min/signin/dashboard",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-200" />
      ),
    },
    {
      label: "Speakers",
      href: "/admin/dashboard/speakers",
      icon: (
        <IconUserDollar className="h-5 w-5 shrink-0 text-neutral-200" />
      ),
    },
    {
      label: "Sponsors",
      href: "/admin/dashboard/parteners",
      icon: (
        <MdAttachMoney className="h-5 w-5 shrink-0 text-neutral-200" />
      ),
    },
    {
      label: "Tickets",
      href: "/admin/dashboard/tickets",
      icon: (
        <IconTicket className="h-5 w-5 shrink-0 text-neutral-200" />
      ),
    },
    
    {
      label: "Volunteers",
      href: "/Ad_min/signin/dashboard/volunteers",
      icon: (
        <IconUser className="h-5 w-5 shrink-0 text-neutral-200" />
      ),
    },
    {
      label: "Contact Us",
      href: "/admin/dashboard/contacts",
      icon: (
        <IconMessage className="h-5 w-5 shrink-0 text-neutral-200" />
      ),
    },
    {
      label: "Subscribers",
      href: "/admin/dashboard/subscribers",
      icon: (
        <IconMailBolt className="h-5 w-5 shrink-0 text-neutral-200" />
      ),
    }
  ];
  const [open, setOpen] = useState(false);
    return (
        <html lang="en">
          <head />
          <body
            className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
          > 
            <div className={cn(
                    " flex w-full flex-1 flex-col overflow-hidden rounded-md border md:flex-row border-neutral-700 ",
                    "h-screen w-screen z-50",
                  )}>
                <AuthProvider>
                  <Sidebar open={open} setOpen={setOpen}>
                          <SidebarBody className="justify-between gap-10 z-50">
                            <div className="flex flex-col items-start overflow-x-hidden overflow-y-auto">
                              {open ? <Logo /> : <LogoIcon />}
                              <div className="mt-8 flex flex-col gap-2">
                                {links.map((link, idx) => (
                                  <SidebarLink key={idx} link={link} />
                                ))}
                              </div>
                              <div className="mt-auto">
                                <LogoutButton />
                              </div>
                            </div>
                          </SidebarBody>
                  </Sidebar>
            <main className="flex-1 overflow-y-auto">
              {children}
            </main></AuthProvider>
            </div>
          </body>
        </html>
      );
};