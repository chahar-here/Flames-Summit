// import { cn } from "@/lib/utils";
// import React from "react";

// export function GridSmallBackgroundDemo() {
//   return (
//     <div>
//       <div
//         className={cn(
//           "fixed inset-0 -z-50",
//           "[background-size:20px_20px]",
//           "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
//           "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
//         )}
//       />
//       {/* Radial gradient for the container to give a faded look */}
//       <div className="pointer-events-none fixed inset-0 -z-50 flex items-center justify-center  [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      
//     </div>
//   );
// }
"use client"; // Required for mouse tracking
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react"; // Import React hooks

export function GridSmallBackgroundDemo() {
  // --- Start of Mouse Tracking Logic ---
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  // --- End of Mouse Tracking Logic ---

  return (
    // We use a React.Fragment (empty tag) to return multiple fixed layers
    <>
      {/* Layer 1: Base Grid (Dark) */}
      <div
        className={cn(
          "fixed inset-0 -z-50 bg-black", // Base layer, at the very back
          "[background-size:20px_20px]",
          // Dark mode grid
          "[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
      />

      {/* Layer 2: Highlight Grid (Bright) */}
      <div
        className={cn(
          "fixed inset-0 -z-40", // On top of the base grid
          "[background-size:20px_20px]",
          // Brighter lines for the highlight effect
          // Dark mode: neutral-500
          "[background-image:linear-gradient(to_right,#737373_1px,transparent_1px),linear-gradient(to_bottom,#737373_1px,transparent_1px)]",
          
          // The mouse-following mask
          "[mask-image:radial-gradient(circle_200px_at_var(--mouse-x)_var(--mouse-y),white,transparent)]",
          "[mask-repeat:no-repeat]",
        )}
        // We pass the mouse position to CSS via custom properties
        style={
          {
            ["--mouse-x" as any]: `${mousePosition.x}px`,
            ["--mouse-y" as any]: `${mousePosition.y}px`,
          } as React.CSSProperties
        }
      />

      {/* Layer 3: Fade (Vignette) */}
      <div
        className={cn(
          "pointer-events-none fixed inset-0 -z-30", // On top of both grids
          "flex items-center justify-center  [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] bg-black",
        )}
      />
    </>
  );
}