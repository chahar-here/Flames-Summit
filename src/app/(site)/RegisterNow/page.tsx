"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { SubscribeForm } from "@/components/ui/SubscribeForm";
import { DotsBackground } from "@/components/ui/InteractiveDotBackground";

export default function RegisterationsPage() {

  return (
    // This main container centers your content.
    // 'relative z-10' ensures it's on top of your background grid.
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 text-center">
      <DotsBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Main Heading */}
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
          Registration Opening Soon
        </h1>

        {/* Sub-heading */}
        <p className="mt-4 text-lg text-neutral-300 sm:text-xl">
          Get ready for India's most exciting startup and Investors summit.
        </p>
      </motion.div>

      {/* Email Capture Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="mt-12 w-full max-w-lg"
      >
        <SubscribeForm />
      </motion.div>
       
      {/* Back to Home Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8"
      >
        <Link
          href="/"
          className="text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-100"
        >
          &larr; Go back to the homepage
        </Link>
      </motion.div>
    </div>
  );
}