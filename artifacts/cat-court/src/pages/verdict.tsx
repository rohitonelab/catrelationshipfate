import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetVerdict, getGetVerdictQueryKey } from '@workspace/api-client-react';
import { CatWizard } from '@/components/cat-wizard';
import { Particles } from '@/components/particles';
import { SceneTransition } from '@/components/scene-transition';
import { Typewriter } from '@/components/typewriter';
import gsap from 'gsap';

export default function VerdictPage() {
  const params = useParams();
  const sessionId = params.sessionId!;
  const [_, setLocation] = useLocation();
  
  const { data: verdict, isLoading } = useGetVerdict(sessionId, {
    query: {
      enabled: !!sessionId,
      queryKey: getGetVerdictQueryKey(sessionId)
    }
  });

  const [stage, setStage] = useState<'intro' | 'rolling' | 'cards' | 'done'>('intro');
  const [introTextComplete, setIntroTextComplete] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [diceValues, setDiceValues] = useState({ d1: 1, d2: 1 });
  const [currentCardIndex, setCurrentCardIndex] = useState(-1);
  const [cardReactionComplete, setCardReactionComplete] = useState(false);
  const diceRef1 = useRef<HTMLDivElement>(null);
  const diceRef2 = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage === 'intro' && verdict) {
      setDiceValues({ d1: verdict.diceRoll.die1, d2: verdict.diceRoll.die2 });
    }
  }, [stage, verdict]);

  const rollDice = () => {
    setIsRolling(true);
    setStage('rolling');
    
    // Zoom in on container
    gsap.to(containerRef.current, { scale: 1.1, duration: 2, ease: "power2.inOut" });

    // 3D Dice rotation animation
    if (diceRef1.current && diceRef2.current) {
      gsap.to([diceRef1.current, diceRef2.current], {
        rotateX: "random(1080, 2160)",
        rotateY: "random(1080, 2160)",
        rotateZ: "random(1080, 2160)",
        duration: 3,
        ease: "power2.inOut",
        onComplete: () => {
          setIsRolling(false);
          // Set to final rotations based on values (simplified, usually maps value to specific rotation)
          gsap.set(diceRef1.current, { rotateX: 0, rotateY: 0, rotateZ: 0 });
          gsap.set(diceRef2.current, { rotateX: 0, rotateY: 0, rotateZ: 0 });
          
          setTimeout(() => {
            gsap.to(containerRef.current, { scale: 1, duration: 1, ease: "power2.inOut" });
            setStage('cards');
            setCurrentCardIndex(0);
          }, 2000);
        }
      });
    }
  };

  const nextCard = () => {
    if (!verdict) return;
    if (currentCardIndex < verdict.cards.length - 1) {
      setCurrentCardIndex(c => c + 1);
      setCardReactionComplete(false);
    } else {
      setLocation(`/report/${sessionId}`);
    }
  };

  if (isLoading || !verdict) {
    return <div className="min-h-screen bg-background" />;
  }

  const currentCard = currentCardIndex >= 0 ? verdict.cards[currentCardIndex] : null;

  const cardColors: Record<string, string> = {
    couple_title: "from-gold to-yellow-600",
    secret_strength: "from-green-500 to-emerald-700",
    mild_complaint: "from-red-500 to-rose-700",
    funniest_contradiction: "from-orange-400 to-amber-600",
    future_prediction: "from-purple-500 to-indigo-700",
    court_sentence: "from-blue-500 to-cyan-700"
  };

  return (
    <SceneTransition location={`/verdict/${sessionId}`}>
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden" ref={containerRef}>
        <Particles />
        
        {stage === 'intro' && (
          <div className="z-10 flex flex-col items-center max-w-2xl text-center">
            <CatWizard state="magic" />
            
            <div className="h-20 mt-12 mb-8">
              <h2 className="text-3xl font-serif text-white/90 italic">
                <Typewriter text="The Court is ready." speed={50} onComplete={() => setIntroTextComplete(true)} />
              </h2>
            </div>

            <AnimatePresence>
              {introTextComplete && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={rollDice}
                  className="px-10 py-5 bg-card border border-gold/50 rounded-full text-xl font-bold tracking-widest uppercase text-gold hover:bg-gold/10 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all animate-float"
                >
                  🎲 Roll The Dice
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}

        {stage === 'rolling' && (
          <div className="z-10 flex flex-col items-center justify-center w-full">
            <div className="relative mb-20 scale-150">
              <CatWizard state="judging" />
            </div>
            
            <div className="flex gap-12 mt-12 perspective-1000">
              {/* Die 1 */}
              <div ref={diceRef1} className="w-24 h-24 bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-md rounded-xl shadow-[0_0_40px_rgba(255,255,255,0.5)] border border-white/40 flex items-center justify-center transform-style-3d">
                {!isRolling && <span className="text-5xl font-black text-black">{diceValues.d1}</span>}
              </div>
              {/* Die 2 */}
              <div ref={diceRef2} className="w-24 h-24 bg-gradient-to-br from-gold/90 to-amber-500/80 backdrop-blur-md rounded-xl shadow-[0_0_40px_rgba(245,158,11,0.6)] border border-gold/40 flex items-center justify-center transform-style-3d">
                {!isRolling && <span className="text-5xl font-black text-black">{diceValues.d2}</span>}
              </div>
            </div>

            {!isRolling && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-12 text-center"
              >
                <h3 className="text-4xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-white via-gold to-white gold-glow">
                  {diceValues.d1} + {diceValues.d2} = {diceValues.d1 + diceValues.d2}
                </h3>
              </motion.div>
            )}
          </div>
        )}

        {stage === 'cards' && currentCard && (
          <div className="z-10 flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-5xl">
            
            {/* The Cat on the side reacting */}
            <div className="hidden md:flex flex-col items-center w-1/3">
              <CatWizard state="idle" />
              <div className="mt-8 h-32 glass-panel p-4 rounded-xl w-full text-center relative border-t border-purple-500/30">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-3 text-xs uppercase tracking-widest text-muted-foreground font-heading">
                  Cat's Note
                </span>
                <p className="text-white/80 font-serif italic text-lg mt-2">
                  <Typewriter 
                    text={currentCard.catReaction || "Interesting..."} 
                    speed={30} 
                    onComplete={() => setCardReactionComplete(true)} 
                    key={`reaction-${currentCardIndex}`}
                  />
                </p>
              </div>
            </div>

            {/* The Card Reveal */}
            <div className="w-full md:w-2/3 flex flex-col items-center perspective-1000">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`card-${currentCardIndex}`}
                  initial={{ rotateY: -90, opacity: 0, z: -200 }}
                  animate={{ rotateY: 0, opacity: 1, z: 0 }}
                  exit={{ rotateY: 90, opacity: 0, z: -200 }}
                  transition={{ duration: 0.8, ease: "backOut" }}
                  className={`w-full max-w-sm aspect-[3/4] rounded-2xl p-1 bg-gradient-to-br ${cardColors[currentCard.type] || 'from-gray-500 to-gray-700'} shadow-2xl relative overflow-hidden`}
                >
                  {/* Card Inner */}
                  <div className="absolute inset-[2px] bg-card/95 backdrop-blur-xl rounded-[14px] p-8 flex flex-col items-center text-center">
                    <div className="text-6xl mb-6 mt-4 drop-shadow-md">{currentCard.emoji}</div>
                    
                    <h3 className="text-2xl font-heading text-white mb-2 uppercase tracking-wide">
                      {currentCard.title}
                    </h3>
                    
                    <div className="w-12 h-1 bg-gold/50 my-6 rounded-full" />
                    
                    <p className="text-xl serif-text text-white/90 leading-relaxed">
                      {currentCard.description}
                    </p>
                  </div>
                  
                  {/* Glare effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] animate-[shimmer_3s_infinite]" />
                </motion.div>
              </AnimatePresence>

              {/* Mobile Cat Reaction (below card) */}
              <div className="md:hidden mt-8 w-full max-w-sm glass-panel p-4 rounded-xl text-center">
                <p className="text-white/80 font-serif italic">
                  <Typewriter 
                    text={currentCard.catReaction || "Interesting..."} 
                    speed={30} 
                    onComplete={() => setCardReactionComplete(true)} 
                    key={`mobile-reaction-${currentCardIndex}`}
                  />
                </p>
              </div>

              <AnimatePresence>
                {cardReactionComplete && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={nextCard}
                    className="mt-8 px-8 py-3 bg-white/5 border border-white/20 hover:border-gold hover:bg-gold/10 rounded-full text-white tracking-widest uppercase text-sm transition-all"
                  >
                    {currentCardIndex < verdict.cards.length - 1 ? "Next Evidence" : "View Final Judgment"}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

      </div>
    </SceneTransition>
  );
}
