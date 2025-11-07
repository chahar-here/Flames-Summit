"use client";
import { cn } from "../../lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  Transition,
} from "motion/react";
import Link from "next/link";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { ThemeToggle } from "../theme-toggle";

// --- Types (All types remain the same) ---
export interface NavItem {
  name: string;
  link?: string;
  children?: {
    name: string;
    link: string;
  }[];
}
interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}
interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}
interface NavItemsProps {
  items: NavItem[];
  className?: string;
  onItemClick?: () => void;
}
interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}
interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}
interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}
// ---

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // MODIFIED: Renamed 'visible' to 'isShrunk' for clarity.
  // This state controls the blur/shrink animation.
  const [isShrunk, setIsShrunk] = useState<boolean>(false);

  // MODIFIED: Added new state for scroll-direction visibility
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // MODIFIED: Added a ref to track the last scroll position
  const lastScrollY = useRef(0);

  // MODIFIED: This hook now controls BOTH states
  useMotionValueEvent(scrollY, "change", (latest) => {
    // 1. Logic for the 'isShrunk' (blur/float) state
    if (latest > 100) {
      setIsShrunk(true);
    } else {
      setIsShrunk(false);
    }

    // 2. Logic for the 'isVisible' (hide/show) state
    // We only apply this logic after the user has scrolled 400px
    // after scrolling for 400px the navbar will hide on scroll down and show on scroll up
    if (latest < 400) {
      setIsVisible(true);
    } else {
      if (latest > lastScrollY.current) {
        // Scrolling Down
        setIsVisible(false);
      } else {
        // Scrolling Up
        setIsVisible(true);
      }
    }

    // 3. Update the last scroll position
    lastScrollY.current = latest;
  });

  return (
    <motion.div
      ref={ref}
      // MODIFIED: Added animation props to hide/show the entire navbar
      animate={{
        y: isVisible ? 0 : "-125%", // Moves the navbar up and down
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      // ---
      className={cn("fixed inset-x-0 z-50 w-full justify-center", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              {
                // MODIFIED: Pass 'isShrunk' to the 'visible' prop,
                // as NavBody and MobileNav expect this for their styling.
                visible: isShrunk,
              },
            )
          : child,
      )}
    </motion.div>
  );
};

//
// --- NO CHANGES NEEDED BELOW THIS LINE ---
// (NavBody, NavItems, MobileNav, etc. all remain the same)
//

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      style={{
        minWidth: "800px",
      }}
      className={cn(
        " mt-5 z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 lg:flex",
        visible && "bg-neutral-950/80",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [active, setActive] = useState<string | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setActive(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2",
        className,
      )}
    >
      {items.map((item, idx) => (
        <div
          key={`nav-item-${idx}`}
          onMouseEnter={() => setActive(item.name)}
          className="relative"
        >
          <a
            
            className="relative px-4 py-2 text-neutral-300"
            href={item.link}
          >
            {active === item.name && (
              <motion.div
                layoutId="hovered"
                className="absolute inset-0 h-full w-full rounded-full bg-neutral-800"
              />
            )}
            <span className="relative z-20">{item.name}</span>
          </a>
{/* MODIFIED: Added dropdown rendering for items with children */}
          {active === item.name && item.children && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={transition}
              className="absolute top-[calc(100%_+_0.5rem)] left-1/2 transform -translate-x-1/2 pt-6"
            >
              <motion.div
                transition={transition}
                layoutId="active-dropdown"
                className="bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-white/[0.2] shadow-xl "
              >
                <motion.div layout className="w-max h-full p-4">
                  <div className="flex flex-col space-y-4 text-sm">
                    {item.children.map((child, cIdx) => (
                      <HoveredLink key={`child-${cIdx}`} href={child.link}>
                        {child.name}
                      </HoveredLink>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "4px" : "2rem",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-4 flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
        visible && " bg-neutral-950/50",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            " z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg px-4 py-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] bg-neutral-950/50",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return isOpen ? (
    <IconX className="text-white" onClick={onClick} />
  ) : (
    <IconMenu2 className="text-white" onClick={onClick} />
  );
};

export const NavbarLogo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal "
    >
      <Image src="/flames_white.png" alt="logo" width={80} height={80} />
    </Link>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-4 py-2 rounded-md bg-[#d1d5db] button text-black text-sm font-bold relative cursor-pointer hover:text-[#E62B1E] transition delay-150 inline-block text-center";

  const variantStyles = {
    primary:
      "shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    secondary: "bg-transparent shadow-none text-white",
    dark: "bg-black text-white shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    gradient:
      "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
} as unknown as Transition;

export const HoveredLink = ({ children, ...rest }: any) => {
  return (
    <a
      {...rest}
      className="text-neutral-300 hover:text-neutral-100 "
    >
      {children}
    </a>
  );
};