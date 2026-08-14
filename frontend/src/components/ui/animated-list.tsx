'use client';

import * as React from 'react';
import { motion, AnimatePresence, type Transition } from 'motion/react';

const easeOut = [0.22, 1, 0.36, 1] as const;

export const cardMotionTransition: Transition = {
  duration: 0.28,
  ease: easeOut,
};

export const layoutTransition: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 36,
  mass: 0.8,
};

interface AnimatedPresenceListProps {
  children: React.ReactNode;
  /** When false, the first paint also plays the enter animation (nice after data loads). */
  playInitial?: boolean;
}

/** Wraps a list so items can enter / leave without hard cuts. */
export function AnimatedPresenceList({
  children,
  playInitial = true,
}: AnimatedPresenceListProps) {
  return (
    <AnimatePresence initial={playInitial} mode="popLayout">
      {children}
    </AnimatePresence>
  );
}

interface AnimatedItemProps {
  id: string;
  index?: number;
  className?: string;
  children: React.ReactNode;
  /** Disable layout morph while a sibling is being dragged. */
  layout?: boolean;
}

export function AnimatedItem({
  id,
  index = 0,
  className,
  children,
  layout = true,
}: AnimatedItemProps) {
  const enterDelay = Math.min(index * 0.035, 0.18);

  return (
    <motion.div
      key={id}
      layout={layout}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.96,
        y: -4,
        transition: { duration: 0.2, ease: easeOut },
      }}
      transition={{
        ...cardMotionTransition,
        delay: enterDelay,
        layout: layoutTransition,
      }}
      className={className}
      style={{ originY: 0 }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedRowProps {
  id: string;
  index?: number;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

/** Table-row friendly enter / exit (tbody children must be <tr>). */
export function AnimatedRow({
  id,
  index = 0,
  className,
  children,
  onClick,
}: AnimatedRowProps) {
  const enterDelay = Math.min(index * 0.03, 0.15);

  return (
    <motion.tr
      key={id}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4, transition: { duration: 0.18, ease: easeOut } }}
      transition={{
        ...cardMotionTransition,
        delay: enterDelay,
        layout: layoutTransition,
      }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.tr>
  );
}
