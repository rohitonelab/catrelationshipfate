import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function CatWizard({ 
  state = 'idle', 
  mouseTracking = false 
}: { 
  state?: 'idle' | 'typing' | 'magic' | 'judging';
  mouseTracking?: boolean;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mouseTracking) {
      setMousePos({ x: 0, y: 0 });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate normalized position (-1 to 1)
      const x = Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth / 2)));
      const y = Math.max(-1, Math.min(1, (e.clientY - centerY) / (window.innerHeight / 2)));
      
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseTracking]);

  const eyeOffsetX = mousePos.x * 4;
  const eyeOffsetY = mousePos.y * 4;

  return (
    <div ref={containerRef} className="relative w-64 h-80 flex items-end justify-center z-10 animate-float-slow">
      {/* Magic Aura */}
      {state === 'magic' && (
        <motion.div 
          className="absolute inset-0 rounded-full bg-purple-500/20 blur-3xl z-[-1]"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      {/* Throne Base (Simplified) */}
      <div className="absolute bottom-0 w-80 h-32 bg-secondary/80 rounded-t-3xl border-t border-purple-500/30 z-0 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjM2EwYzU5IiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cGF0aCBkPSJNMCAwbDhfOHptOCAwTDBfOHoiIHN0cm9rZT0iIzc4M2FlZCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4=')] opacity-30"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>
      </div>

      {/* Cat Body SVG */}
      <svg width="240" height="280" viewBox="0 0 240 280" className="z-10 overflow-visible relative">
        <defs>
          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="robeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4c1d95" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Tail */}
        <g className="animate-tail">
          <path d="M 180 200 Q 220 220 200 260" fill="none" stroke="#111" strokeWidth="16" strokeLinecap="round" />
        </g>

        {/* Robe Back */}
        <path d="M 60 140 L 180 140 L 210 260 L 30 260 Z" fill="url(#robeGradient)" />
        <path d="M 60 140 L 180 140 L 210 260 L 30 260 Z" fill="none" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.5" />

        {/* Head */}
        <g transform="translate(120, 100)">
          {/* Ears */}
          <g className="animate-ear-l">
            <path d="M -40 -30 L -60 -80 L -10 -40 Z" fill="#111" />
            <path d="M -35 -35 L -50 -70 L -15 -42 Z" fill="#2d1656" />
          </g>
          <g className="animate-ear-r">
            <path d="M 40 -30 L 60 -80 L 10 -40 Z" fill="#111" />
            <path d="M 35 -35 L 50 -70 L 15 -42 Z" fill="#2d1656" />
          </g>

          {/* Face */}
          <ellipse cx="0" cy="0" rx="55" ry="45" fill="#111" />
          <path d="M -55 0 Q 0 40 55 0 Q 0 60 -55 0 Z" fill="#222" />

          {/* Eyes */}
          <g className="animate-blink">
            {/* Left Eye */}
            <g transform={`translate(${-20 + eyeOffsetX}, ${-5 + eyeOffsetY})`}>
              <ellipse cx="0" cy="0" rx="14" ry="18" fill="#000" />
              <ellipse cx="0" cy="0" rx="12" ry="16" fill="#f59e0b" />
              <ellipse cx="0" cy="0" rx="2" ry="10" fill="#000" />
              <circle cx="-3" cy="-5" r="3" fill="#fff" opacity="0.8" />
              <circle cx="0" cy="0" r="18" fill="url(#eyeGlow)" opacity={state === 'magic' || state === 'judging' ? "0.6" : "0.2"} />
            </g>

            {/* Right Eye */}
            <g transform={`translate(${20 + eyeOffsetX}, ${-5 + eyeOffsetY})`}>
              <ellipse cx="0" cy="0" rx="14" ry="18" fill="#000" />
              <ellipse cx="0" cy="0" rx="12" ry="16" fill="#f59e0b" />
              <ellipse cx="0" cy="0" rx="2" ry="10" fill="#000" />
              <circle cx="-3" cy="-5" r="3" fill="#fff" opacity="0.8" />
              <circle cx="0" cy="0" r="18" fill="url(#eyeGlow)" opacity={state === 'magic' || state === 'judging' ? "0.6" : "0.2"} />
            </g>
          </g>

          {/* Nose & Mouth */}
          <path d="M -6 15 L 6 15 L 0 20 Z" fill="#f472b6" />
          <path d="M 0 20 Q -10 25 -20 20 M 0 20 Q 10 25 20 20" fill="none" stroke="#333" strokeWidth="2" />
          
          {/* Whiskers */}
          <path d="M -25 15 L -60 10 M -25 20 L -65 20 M -25 25 L -60 30" fill="none" stroke="#444" strokeWidth="1" />
          <path d="M 25 15 L 60 10 M 25 20 L 65 20 M 25 25 L 60 30" fill="none" stroke="#444" strokeWidth="1" />

          {/* Wizard Hat (optional, maybe keep him bare-headed but robed?) */}
          <path d="M -60 -35 Q 0 -60 60 -35 L 40 -120 L 0 -150 L -40 -120 Z" fill="#3b0764" />
          <path d="M -65 -35 Q 0 -20 65 -35 Q 0 -50 -65 -35 Z" fill="#581c87" />
          {/* Hat Stars */}
          <path d="M 0 -80 L 5 -70 L 15 -70 L 7 -60 L 10 -50 L 0 -55 L -10 -50 L -7 -60 L -15 -70 L -5 -70 Z" fill="#f59e0b" transform="scale(0.5) translate(0, -60)" />
        </g>

        {/* Robe Front Collar */}
        <path d="M 90 140 Q 120 180 150 140" fill="none" stroke="#f59e0b" strokeWidth="4" />
        <circle cx="120" cy="165" r="8" fill="#f59e0b" filter="url(#glow)" />

        {/* Paws */}
        <g transform="translate(90, 240)">
          <ellipse cx="0" cy="0" rx="15" ry="10" fill="#111" />
          <path d="M -5 5 L -5 10 M 0 5 L 0 10 M 5 5 L 5 10" fill="none" stroke="#333" strokeWidth="1.5" />
        </g>
        <g transform="translate(150, 240)">
          <ellipse cx="0" cy="0" rx="15" ry="10" fill="#111" />
          <path d="M -5 5 L -5 10 M 0 5 L 0 10 M 5 5 L 5 10" fill="none" stroke="#333" strokeWidth="1.5" />
        </g>

        {/* Floating Notebook / Dice depending on state */}
        <AnimatePresence>
          {state === 'typing' && (
            <motion.g
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="origin-center"
            >
              <rect x="25" y="160" width="60" height="50" rx="2" fill="#fffaf0" transform="rotate(-10 50 180)" />
              <rect x="30" y="165" width="50" height="40" rx="1" fill="none" stroke="#d1d5db" strokeWidth="1" transform="rotate(-10 50 180)" />
              {/* Quill */}
              <motion.g 
                animate={{ rotate: [-5, 5, -5], y: [-2, 2, -2] }} 
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <path d="M 60 180 L 80 140 Q 90 130 95 145 Q 85 155 60 180 Z" fill="#e2e8f0" stroke="#94a3b8" />
                <path d="M 60 180 L 55 185" stroke="#333" strokeWidth="2" />
              </motion.g>
            </motion.g>
          )}
        </AnimatePresence>

      </svg>
    </div>
  );
}
