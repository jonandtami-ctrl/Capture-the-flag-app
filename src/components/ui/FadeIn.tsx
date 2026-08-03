"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export default function FadeIn({
  children,
  className,
  delay = 0,
  y = 24,
}: FadeInProps) {
  return (
    <motion.div
      className={clsx(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
