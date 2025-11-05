"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { IconBrandInstagram, IconBrandLinkedin, IconBrandX } from "@tabler/icons-react";
import { SubscribeForm } from "./SubscribeForm";

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-gray-300 pt-10 pb-10">
      <div className="max-w-7xl mx-auto px-2">
        {/* Grid layout for footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-24 mb-10">
          {/* Logo & Social Media links*/}
          <div className=" w-full flex-col items-center justify-center md:justify-start">
            <Link href="/" className="inline-block">
            <Image
              src="/flames_white.png"
              alt="Tedxsviet"
              width={300}
              height={300}
              className="object-contain"
            />
            </Link>
            {/* Social Media links */}
            <div className="flex items-center justify-center mt-6 space-x-10">
              <a href="https://x.com/flamessummit" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                <IconBrandX size={30}/>
              </a>
              <a href="https://www.linkedin.com/company/flamessummitindia" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                <IconBrandLinkedin size={30}/>
              </a>
              <a href="https://www.instagram.com/flamessummitindia" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                <IconBrandInstagram size={32}/>
              </a>
            </div>
          </div>
          {/* Navigation Links */}
          <div className="text-center md:text-left font-semibold text-md flex md:flex-col gap-4 justify-center">
            {/* <h3 className="text-lg font-semibold text-white">Quick Links</h3> */}
                <Link href="/partenerwithus" className="hover:text-white transition">
                 Partner with us
                </Link>
                <Link href="/callforvolunteers" className="hover:text-white transition">
                  Become a Volunteer
                </Link>
                <Link href="/faqs" className="hover:text-white transition">
                  FAQs
                </Link>
          </div>
          {/* Contact Information */}
          <div className="text-center md:text-left font-semibold text-md flex flex-col gap-4 justify-center">
            {/* <h3 className="text-lg font-bold text-white">Contact Us</h3> */}
            <p className="hover:text-white transition">Email: info@flamessummit.org</p>
            <p className="hover:text-white transition">Phone: 9672293975</p>
            <p className="hover:text-white transition">Location: Chandigarh, India</p>
          </div>
          {/* Subscribe us */}
          <div className="flex flex-col gap-2 items-center justify-center md:items-start">
            {/* Subscribe Now */}
            <SubscribeForm/>
          </div>
        </div>

        {/* Divider + Copyright */}
        <hr className="border-[#E62B1E] sm:block" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-bold text-sm text-center mt-6">
          <Link href="/guidelines" className="hover:text-white transition md:text-left">
            Event rules and regulations
          </Link>
          <Link href="/privacy" className="hover:text-white transition md:text-left">
            Privacy Policy
          </Link>
          <p className="md:text-right">
          Copyright © 2025 TEDXSVIET
        </p>
        </div>
      </div>
    </footer>
  );
}
