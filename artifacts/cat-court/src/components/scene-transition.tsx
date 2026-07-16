import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SceneTransition({ children, location }: { children: React.ReactNode; location: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full min-h-screen flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
