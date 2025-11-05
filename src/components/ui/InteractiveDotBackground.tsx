"use client";
import React, { useState, useEffect } from "react";
import { cn } from "../../lib/utils"; // Using your path

export function InteractiveDotBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // We listen to the mousemove event on the whole window
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Don't forget to clean up the event listener
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className={cn(
        // Base layer (Gray dots)
        "fixed inset-0 -z-50",
        "[background-size:20px_20px]",
        "[background-image:radial-gradient(#404040_1px,transparent_1px)]",

        // ADDED: This mask applies to the entire container, fading both layers
        "[mask-image:radial-gradient(ellipse_at_center,white_50%,transparent_100%)]",

        // Top layer (White dots)
        // We use a ::after pseudo-element for this
        "after:content-[''] after:fixed after:inset-0 after:-z-40",
        "after:[background-size:20px_20px]",
        "after:[background-image:radial-gradient(white_1px,transparent_1px)]",

        // The Mask for the top layer (follows mouse)
        // This reveals the white dots only around the mouse
        "after:[mask-image:radial-gradient(circle_200px_at_var(--mouse-x)_var(--mouse-y),white,transparent)]",
        "after:[mask-repeat:no-repeat]"
      )}
      // We pass the mouse position to CSS via custom properties
      style={
        {
          ["--mouse-x" as any]: `${mousePosition.x}px`,
          ["--mouse-y" as any]: `${mousePosition.y}px`,
        } as React.CSSProperties
      }
    />
  );
}