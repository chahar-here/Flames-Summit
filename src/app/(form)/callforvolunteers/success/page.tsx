'use client';

import { InteractiveDotBackground } from '@/components/ui/InteractiveDotBackground';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamically import Confetti (client-only)
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

const SuccessPage = () => {
  const router = useRouter();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false); // 👈 new

  useEffect(() => {
    setIsClient(true); // mark as client-rendered

    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();

    const timer = setTimeout(() => router.push('/'), 5000);

    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      clearTimeout(timer);
    };
  }, [router]);

  // Don’t render until mounted (prevents SSR/client mismatch)
  if (!isClient) return null;

  return (
    <div className="relative min-h-screen bg-transparent">
      <InteractiveDotBackground />

      <div className="fixed inset-0 z-50 bg-transparent flex flex-col items-center justify-center">
        {windowSize.width > 0 && windowSize.height > 0 && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
          />
        )}

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="text-center p-6 bg-transparent rounded-2xl shadow-2xl backdrop-blur-md"
        >
          <div className="w-[200px] h-[200px] mx-auto relative">
            <img
              src="/flames_white.png"
              alt="Flames Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mt-4 dark:text-green-400">
            Submitted Successfully!
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mt-2 max-w-md">
            Thanks for connecting with us! We will get back to you soon.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SuccessPage;
