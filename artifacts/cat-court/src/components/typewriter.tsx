import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export function Typewriter({ text, speed = 40, onComplete, className = "" }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    setIsTyping(true);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(c => c + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (isTyping) {
      setIsTyping(false);
      if (onComplete) onComplete();
    }
  }, [currentIndex, text, speed, isTyping, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      <motion.span 
        animate={{ opacity: [1, 0, 1] }} 
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block ml-[2px] w-[6px] h-[1em] bg-gold align-middle"
      />
    </span>
  );
}
