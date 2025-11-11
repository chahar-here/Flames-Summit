"use client";

import "../globals.css";
import { useState } from "react";
import React from "react";
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
  NavItem,
} from "@/components/navbar/Nav";
import { inter, jetbrainsMono } from '../fonts';
import { Footer } from "@/components/footer/footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // const navItems: NavItem[] = [
  //   { name: "About", link: "/about" },
  //   {
  //     name: "Conference",
  //     link: "/conference",
  //     children: [
  //       { name: "Speakers", link: "/speakers" },
  //       { name: "Schedule", link: "/schedule" },
  //       { name: "Workshops", link: "/workshops" },
  //     ],
  //   },
  //   {
  //     name: "Partners",
  //     children: [
  //       { name: "Partners", link: "/partners" },
  //       { name: "Become a Partner", link: "/becomeapartner" },
  //     ],
  //   },
  //   {
  //     name: "Grant Initiatives",
  //     children: [
  //       { name: "The SPARK Challenge", link: "/sparks" },
  //       { name: "The SCALE-UP Challenge", link: "/scaleup" },
  //       { name: "The Bharatpreneurs Challenge", link: "/bharatpreneurs" },
  //       { name: "The Womenpreneurs Challenge", link: "/womenpreneurs" },
  //     ],
  //   },
  //   { name: "Investors", link: "/investors" },
  // ];

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {/* ✅ Navbar */}
        {/* <Navbar>
          <NavBody>
            <NavbarLogo />
            <NavItems items={navItems} />
            <div className="flex items-center gap-4">
              <NavbarButton variant="primary" href="/RegisterNow">
                Register Now
              </NavbarButton>
            </div>
          </NavBody>
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
              {navItems.map((item, idx) => (
                <React.Fragment key={`mobile-link-${idx}`}>
                  <a
                    href={item.link}
                    onClick={() => {
                      if (!item.children) setIsMobileMenuOpen(false);
                    }}
                    className="relative text-neutral-800 font-semibold"
                  >
                    <span className="block">{item.name}</span>
                  </a>
                  {item.children && (
                    <div className="flex flex-col pl-4 mt-2 space-y-2">
                      {item.children.map((child, cIdx) => (
                        <a
                          key={`mobile-child-${cIdx}`}
                          href={child.link}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="relative text-neutral-600"
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
                className="mt-4 w-full"
              >
                Tickets
              </NavbarButton>
            </MobileNavMenu>
          </MobileNav>
        </Navbar> */}

        {/* ✅ Main Content */}
        {children}

        {/* ✅ Footer */}
        <Footer />
      </body>
    </html>
  );
}
