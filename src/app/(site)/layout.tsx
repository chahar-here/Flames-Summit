"use client";
import { Geist, Geist_Mono, Inter, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { useState } from "react";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  Navbar,
  NavbarButton,
  NavbarLogo,
  NavBody,
  NavItems,
  NavItem, // MODIFIED: Import the NavItem type
} from "@/components/navbar/Nav";
import { Footer } from "@/components/footer/footer";
import React from "react"; // MODIFIED: Import React for React.Fragment

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // MODIFIED: Updated navItems to use the new structure with children
  const navItems: NavItem[] = [
    {
      name: "About",
      link: "/about",
    },
    {
      name: "Conference",
      link: "/conference", // This is the parent link
      children: [
        { name: "Speakers", link: "/speakers" },
        { name: "Schedule", link: "/schedule" },
        { name: "Workshops", link: "/workshops" },
      ],
    },
    {
      name: "Partners",
      children: [
        { name: "Partners", link: "/partners" },
        { name: "Become a Partner", link: "/becomeapartner" },
      ]
    },
    {
      name: "Grant Initiatives",
      children: [
        { name: "The SPARK Challenge", link: "/sparks" },
        { name: "The SCALE-UP Challenge", link: "/scaleup" },
        { name: "The Bharatpreneurs Challenge", link: "/bharatpreneurs" },
        { name: "The Womenpreneurs Challenge", link: "/womenpreneurs" },
      ]
    },
    // {
    //   name: "Special Programs",
    //   children: [
    //     { name: "Mentoring", link: "/sparks" },
    //     { name: "", link: "/scaleup" }
    //   ]
    // },
    {
      name: "Investors",
      link: "/investors",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Navbar>
          {/* Desktop Navigation */}
          <NavBody>
            <NavbarLogo />
            <NavItems items={navItems} />
            <div className="flex items-center gap-4">
              <NavbarButton variant="primary" href="/RegisterNow" target="">
                Register Now
              </NavbarButton>
            </div>
          </NavBody>

          {/* Mobile Navigation */}
          <MobileNav>
            <MobileNavHeader>
              <NavbarLogo />
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </MobileNavHeader>

            <MobileNavMenu
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            >
              {/* MODIFIED: Updated mobile menu to render nested items */}
              {navItems.map((item, idx) => (
                <React.Fragment key={`mobile-link-${idx}`}>
                  <a
                    href={item.link} // Main link
                    onClick={() => {
                      // Only close menu if it's NOT a parent item
                      // (allows user to click parent link without closing)
                      if (!item.children) {
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className="relative text-neutral-300 font-semibold" // Make parent bold
                  >
                    <span className="block">{item.name}</span>
                  </a>
                  {/* Render children if they exist */}
                  {item.children && (
                    <div className="flex flex-col pl-4 mt-2 space-y-2">
                      {item.children.map((child, cIdx) => (
                        <a
                          key={`mobile-child-${cIdx}`}
                          href={child.link}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="relative text-neutral-400" // Indent and change color
                        >
                          <span className="block">{child.name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              ))}
              <NavbarButton
                variant="primary"
                href="/tickets"
                target=""
                className="mt-4 w-full"
              >
                Tickets
              </NavbarButton>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>
        {children}
        <Footer />
      </body>
    </html>
  );
}