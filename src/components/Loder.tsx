"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Loader() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Don’t render during SSR

  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      >
        <Image
          src="/flames_white.png"
          alt="Loading..."
          width={120}
          height={120}
          priority
        />
      </motion.div>
    </div>
  );
}
