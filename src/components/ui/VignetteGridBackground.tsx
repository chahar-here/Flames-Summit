"use client";

import { cn } from "@/lib/utils";

export function VignetteGridBackground() {
  return (
    <div
      className={cn(
      "fixed inset-0 -z-50 bg-black",
      // Grid
      "[background-size:20px_20px]",
      "[background-image:linear-gradient(to_right,#303030_1px,transparent_1px),linear-gradient(to_bottom,#303030_1px,transparent_1px)]",
    
      // Fade grid toward edges (vignette mask)
      "[mask-image:radial-gradient(circle at center, white 40%, transparent 100%)]",
      "[mask-repeat:no-repeat]",
    
      // Add dark vignette shading for focus effect
      "after:content-[''] after:absolute after:inset-0 after:pointer-events-none",
      "after:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_70%,rgba(0,0,0,0.75)_100%)]"
    )}
    />
  );
}
