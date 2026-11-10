"use client";
import React, { SVGProps, useState } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "@/lib/utils";

export const StickyBanner = ({
  className,
  children,
  hideOnScroll = false,
}: {
  className?: string;
  children: React.ReactNode;
  hideOnScroll?: boolean;
}) => {
  const [open, setOpen] = useState(true);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (hideOnScroll && latest > 40) {
      setOpen(false);
    } else if (hideOnScroll) {
      setOpen(true);
    }
  });

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          className="sticky inset-x-0 top-0 z-40 w-full shrink-0 overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            duration: 0.25,
            ease: "easeInOut",
          }}
        >
          <div
            className={cn(
              "relative flex min-h-11 w-full items-center justify-center px-4 py-2",
              className
            )}
          >
            {children}

            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1 rounded-full hover:bg-white/10 transition"
              onClick={() => setOpen(false)}
              title="Close announcement"
            >
              <CloseIcon className="h-4 w-4 text-white" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CloseIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  );
};
