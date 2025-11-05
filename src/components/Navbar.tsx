"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import logo from "../assets/logo.png"
import { ThemeToggle } from "./theme-toggle";

type MenuItem = {
  title: string;
  hasDropdown?: boolean;
  DropdownOptions?: string[];
  LinksList?: string[];
};

const menuItems: MenuItem[] = [
  {
    title: "About",
    hasDropdown: true,
    DropdownOptions: [
      "About Startup Mahakumbh",
      "Organising Committee",
      "Pavilions",
      "Brochure",
      "Photo Gallery",
      "Get your Photos",
    ],
    LinksList: [
      "/about/about-startup",
      "/about/organising-committee",
      "/about/pavilions",
      "/about/brochure",
      "/about/photo-gallery",
      "/about/get-your-photo",
    ],
  },
  {
    title: "Conference",
    hasDropdown: true,
    DropdownOptions: [
      "About Conference",
      "Agenda 2026",
      "Featured talk",
      "Delegate fee",
      "Speakers",
    ],
    LinksList: [
      "/conference/about-conference",
      "/conference/agenda",
      "/conference/featured-talk",
      "/conference/delegate-fee",
      "/conference/speakers",
    ],
  },
  {
    title: "Exhibition",
    hasDropdown: true,
    DropdownOptions: [
      "About Exhibition",
      "Exhibition Tariff",
      "Payment Details",
      "Floor Plan",
      "Business Visitor",
      "Exhibition Directory 2025",
      "Special Programmes",
    ],
    LinksList: [
      "/exhibition/about-exhibition",
      "/exhibition/exhibition-tariff",
      "/exhibition/payment-details",
      "/exhibition/floor-plan",
      "/exhibition/business-visitor",
      "/exhibition/exhibition-directory",
      "/exhibition/special-programmes",
    ],
  },
  { title: "Investors", hasDropdown: false },
  {
    title: "Partnership",
    hasDropdown: true,
    DropdownOptions: ["Partners", "Partnership"],
    LinksList: ["/partners", "/partnership"],
  },
  { title: "Special Programmes", hasDropdown: false },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <nav className="w-full border-b bg-white shadow-sm sticky top-0 z-50 dark:bg-gray-900 dark:border-gray-700">
      <div className="flex justify-between items-center px-6 md:px-12 py-2">
        {/* Logo + Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
          <Image
            src={logo}
            alt="Startup Mahakumbh Logo"
            height={70}
          />
        </div>

        {/* Desktop Menu (Hover dropdowns) */}
        <div className="hidden lg:flex items-center space-x-8">
          {menuItems.map((item) => (
            <div
              key={item.title}
              className="relative group"
            >
              <div className="flex items-center space-x-1 text-gray-700 hover:text-blue-700 transition-colors cursor-pointer dark:text-gray-300 dark:hover:text-blue-400">
                <span>{item.title}</span>
                {item.hasDropdown && <ChevronDown size={16} />}
              </div>

              {item.hasDropdown && (
                <div className="absolute left-0 mt-2 bg-white border rounded-lg shadow-lg p-3 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transform -translate-y-2 transition-all duration-200 dark:bg-gray-800 dark:border-gray-600">
                  <ul className="space-y-2 text-sm text-gray-600">
                    {item.DropdownOptions?.map((option, index) => (
                      <li key={option}>
                        <Link
                          href={item.LinksList?.[index] || "#"}
                          className="block hover:text-blue-700 transition py-1 px-2 rounded dark:hover:text-blue-400 dark:text-gray-300"
                        >
                          {option}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          <ThemeToggle />
          <button className="bg-[#000C45] text-white px-6 py-2 rounded-md hover:bg-blue-900 transition">
            Register Now
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-gray-700 dark:text-gray-300"
          >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu (Click dropdowns) */}
      {menuOpen && (
        <div className="lg:hidden px-6 pb-4 space-y-3">
          {menuItems.map((item) => (
            <div key={item.title}>
              <button
                onClick={() =>
                  item.hasDropdown ? toggleDropdown(item.title) : null
                }
                className="flex items-center justify-between w-full text-gray-700 py-2 hover:text-blue-700 transition-colors dark:text-gray-300 dark:hover:text-blue-400"
              >
                <span>{item.title}</span>
                {item.hasDropdown && <ChevronDown size={16} />}
              </button>

              {item.hasDropdown && activeDropdown === item.title && (
                <ul className="pl-4 space-y-2 text-sm text-gray-600 border-l-2 border-gray-200 ml-2 mt-1">
                  {item.DropdownOptions?.map((option, index) => (
                    <li key={option}>
                      <Link
                          href={item.LinksList?.[index] || "#"}
                          className="block hover:text-blue-700 transition py-1 px-2 rounded dark:hover:text-blue-400 dark:text-gray-300"
                          onClick={() => setMenuOpen(false)}
                        >
                        {option}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between">
            <ThemeToggle />
            <button className="bg-[#000C45] text-white py-2 rounded-md hover:bg-blue-900 transition px-6">
              Register Now
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}