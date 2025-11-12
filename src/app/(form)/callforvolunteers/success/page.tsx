'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DotsBackground } from '@/components/ui/InteractiveDotBackground';

export default function SuccessPage() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    setShowPopup(true);

    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      setShowPopup(false);
      router.push('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4 relative overflow-hidden">
      <DotsBackground/>
      {/* 🔥 Subtle moving red glow background */}
      {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_60%)] animate-pulse" /> */}

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 backdrop-blur-xl bg-[rgba(20,20,20,0.85)] border border-[rgba(255,255,255,0.3)] shadow-[0_0_30px_rgba(255,0,0,0.3)] rounded-2xl max-w-md w-full p-6 text-center"
          >
            <div className="flex flex-col items-center">
              <Image
                src="/flames_white.png"
                alt="Flames Summit Logo"
                width={100}
                height={100}
                className="mb-4"
              />

              {/* 🔥 Red headline */}
              <h1 className="text-2xl font-bold text-red-500 mb-2">
                Volunteer Form Submitted 🎉
              </h1>

              <p className="text-gray-300 mb-4">
                Thank you for showing interest in becoming a <strong className="text-red-400">Flames Summit Volunteer</strong>!
              </p>

              <p className="text-gray-400">
                Our team will review your application and connect with you soon.  
                Redirecting to homepage...
              </p>

              {/* 🔥 Red Spinner */}
              <motion.div
                className="mt-6 w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"
                transition={{ repeat: Infinity }}
              />
            </div>

            {/* 🔥 Optional glowing border animation */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white blur-sm animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
