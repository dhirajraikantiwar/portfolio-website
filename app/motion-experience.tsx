"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { createElement, ElementType, ReactNode, useRef } from "react";

export function MotionPortrait() {
  const target = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 38]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.025]);
  return <motion.div ref={target} className="r-portrait portrait-motion" style={reduceMotion ? undefined : { y, scale }}><img className="portrait-plate" src="/assets/plates/portrait.png?v=5" alt="Dhiraj Raikantiwar" /></motion.div>;
}

export function Reveal({ as = "section", className, id, children }: { as?: ElementType; className?: string; id?: string; children: ReactNode }) {
  return createElement(as, { className, id }, children);
}
