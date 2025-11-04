"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

export default function EyeFollower() {
  const leftPupil = useRef<SVGCircleElement>(null);
  const rightPupil = useRef<SVGCircleElement>(null);
  const mouthRef = useRef<SVGPathElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const moveEyes = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const eyes = [leftPupil.current, rightPupil.current];

      eyes.forEach((eye) => {
        if (!eye) return;

        const bounds = eye.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;

        const dx = clientX - centerX;
        const dy = clientY - centerY;
        const angle = Math.atan2(dy, dx);
        const distance = Math.min(6, Math.hypot(dx, dy) / 15);

        gsap.to(eye, {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          duration: 0.2,
          ease: "power2.out",
        });
      });
    };

    window.addEventListener("mousemove", moveEyes);
    return () => window.removeEventListener("mousemove", moveEyes);
  }, []);

  useEffect(() => {
    if (!mouthRef.current) return;
    gsap.to(mouthRef.current, {
      attr: {
        d: isFocused
          ? "M80,90 Q100,110 120,90" // open smile
          : "M80,95 Q100,100 120,95", // flat mouth
      },
      duration: 0.3,
      ease: "power1.out",
    });
  }, [isFocused]);

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 200 150" className="w-40 md:w-48 drop-shadow-xl">
        {/* Face */}
        <circle cx="100" cy="75" r="60" fill="#000000" stroke="#E62B1E" strokeWidth="4" />

        {/* Eyes */}
        <circle cx="75" cy="60" r="12" fill="#FFFFFF" />
        <circle ref={leftPupil} cx="75" cy="60" r="6" fill="#E62B1E" />
        <circle cx="125" cy="60" r="12" fill="#FFFFFF" />
        <circle ref={rightPupil} cx="125" cy="60" r="6" fill="#E62B1E" />

        {/* Brows */}
        <path d="M65,48 Q75,42 85,48" stroke="#E62B1E" strokeWidth="3" fill="none" />
        <path d="M115,48 Q125,42 135,48" stroke="#E62B1E" strokeWidth="3" fill="none" />

        {/* Mouth */}
        <path
          ref={mouthRef}
          d="M80,95 Q100,100 120,95"
          stroke="#FFFFFF"
          strokeWidth="4"
          fill="none"
        />
      </svg>

      {/* Invisible input for mouth animation trigger */}
      <input
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
      />
    </div>
  );
}
