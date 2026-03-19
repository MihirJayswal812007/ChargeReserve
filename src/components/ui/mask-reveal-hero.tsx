"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Mask Reveal Hero
 * Matches the strict Aceternity SVG Mask Effect implementation
 * using an external SVG file (/mask.svg) mapped on WebkitMaskImage.
 */
export const MaskRevealHero = ({
  baseContent,
  revealContent,
  size = 0,
  revealRadius = 300,
  className,
}: {
  baseContent?: React.ReactNode;
  revealContent?: React.ReactNode;
  size?: number;
  revealRadius?: number;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState<any>({ x: null, y: null });
  const containerRef = useRef<any>(null);

  const updateMousePosition = (e: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    const node = containerRef.current;
    if (node) {
      node.addEventListener("mousemove", updateMousePosition);
      return () => {
        node.removeEventListener("mousemove", updateMousePosition);
      };
    }
  }, []);

  const revealSize = revealRadius * 2;
  const maskSize = isHovered ? revealSize : size;

  return (
    <motion.div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn("relative cursor-default", className)}
    >
      {/* Base content (Layer 1) - Masked out dynamically where the spotlight hits */}
      <motion.div
        className="w-full h-full text-white"
        animate={{
          WebkitMaskImage: isHovered 
            ? `linear-gradient(black, black), url(/mask.svg)`
            : `none`,
          WebkitMaskComposite: isHovered ? "destination-out" : "source-over",
          maskComposite: isHovered ? "exclude" : "add",
          WebkitMaskPosition: isHovered 
            ? `0 0, ${mousePosition.x - maskSize / 2}px ${mousePosition.y - maskSize / 2}px` 
            : "0 0",
          WebkitMaskSize: isHovered ? `100%, ${maskSize}px` : "auto",
          WebkitMaskRepeat: isHovered ? "repeat, no-repeat" : "repeat",
        } as any}
        transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
      >
        {baseContent}
      </motion.div>

      {/* Masked reveal layer (Layer 2) - Standard spotlight */}
      <motion.div
        className="absolute inset-0 w-full h-full pointer-events-none z-10 [mask-image:url(/mask.svg)] [mask-repeat:no-repeat]"
        animate={{
          WebkitMaskPosition: `${mousePosition.x - maskSize / 2}px ${
            mousePosition.y - maskSize / 2
          }px`,
          WebkitMaskSize: `${maskSize}px`,
        } as any}
        transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
      >
        <div className="absolute inset-0 w-full h-full">
          {revealContent}
        </div>
      </motion.div>
    </motion.div>
  );
};
