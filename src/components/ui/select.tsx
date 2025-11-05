"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useMotionTemplate, useMotionValue, motion } from "motion/react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    const radius = 100; // radius of hover glow
    const [visible, setVisible] = React.useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: any) {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }

    return (
      <motion.div
        style={{
          background: useMotionTemplate`
          radial-gradient(
            ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
            #E62B1E,
            transparent 80%
          )
        `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="group/select rounded-lg p-[2px] transition duration-300"
      >
        <select
          ref={ref}
          {...props}
          className={cn(
            `shadow-input flex h-10 w-full rounded-md border-none bg-zinc-800 px-3 py-2 text-sm text-white 
             placeholder:text-neutral-100 transition duration-400 
             group-hover/select:shadow-none 
             focus-visible:ring-[2px] focus-visible:ring-neutral-400 
             focus-visible:outline-none 
             disabled:cursor-not-allowed disabled:opacity-50 
             dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600`,
            className
          )}
        >
          {children}
        </select>
      </motion.div>
    );
  }
);

Select.displayName = "Select";

export { Select };
