'use client';

import { InteractiveDotBackground } from '@/components/ui/InteractiveDotBackground';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamically import Confetti (client-only)
const Confetti = dynamic(() => import('react-confetti'), { 
  ssr: false,
  loading: () => null // Add loading state
});

const SuccessPage = () => {
  const router = useRouter();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      updateSize();
      window.addEventListener('resize', updateSize);
    }

    const timer = setTimeout(() => router.push('/'), 5000);
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateSize);
      }
      clearTimeout(timer);
    };
  }, [router]);

  // Don't render until mounted on client
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-transparent">
      <InteractiveDotBackground />
      <div className="fixed inset-0 z-50 bg-transparent flex flex-col items-center justify-center">
        {isMounted && windowSize.width > 0 && windowSize.height > 0 && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
          />
        )}
        {/* ... rest of your JSX ... */}
      </div>
    </div>
  );
};

export default SuccessPage;