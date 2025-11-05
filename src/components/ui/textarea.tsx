"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useMotionTemplate, useMotionValue, motion } from "motion/react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const radius = 100; // controls the glow radius
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
        className="group/textarea rounded-lg p-[2px] transition duration-300"
      >
        <textarea
          ref={ref}
          {...props}
          className={cn(
            `shadow-input placeholder:text-neutral-100 flex w-full rounded-md border-none bg-zinc-800 px-3 py-2 text-sm text-white 
             transition duration-400 group-hover/textarea:shadow-none 
             focus-visible:ring-[2px] focus-visible:ring-neutral-400 
             focus-visible:outline-none 
             disabled:cursor-not-allowed disabled:opacity-50 
             dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600`,
            className
          )}
        />
      </motion.div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
