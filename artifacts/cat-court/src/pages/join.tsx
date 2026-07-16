import { useState, useRef, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubmitAnswersB } from '@workspace/api-client-react';
import { CatWizard } from '@/components/cat-wizard';
import { Particles } from '@/components/particles';
import { SceneTransition } from '@/components/scene-transition';
import { Typewriter } from '@/components/typewriter';
import { PARTNER_B_QUESTIONS } from '@/data/questions';

export default function JoinPage() {
  const params = useParams();
  const sessionId = params.sessionId!;
  const partnerBToken = params.partnerBToken!;
  const [_, setLocation] = useLocation();
  const submitAnswers = useSubmitAnswersB();
  
  const [portalOpen, setPortalOpen] = useState(false);
  const [currentQIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [catState, setCatState] = useState<'idle' | 'typing'>('idle');
  const [questionTextComplete, setQuestionTextComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const currentQ = PARTNER_B_QUESTIONS[currentQIndex];

  useEffect(() => {
    // Portal opening sequence
    const timer = setTimeout(() => {
      setPortalOpen(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleTextComplete = () => {
    setQuestionTextComplete(true);
    setCatState('idle');
  };

  useEffect(() => {
    if (portalOpen) {
      setCatState('typing');
      setQuestionTextComplete(false);
    }
  }, [currentQIndex, portalOpen]);

  const handleAnswer = (optionIndex: number) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);
    setCatState('typing');
    
    setTimeout(() => {
      if (currentQIndex < PARTNER_B_QUESTIONS.length - 1) {
        setCurrentIndex(currentQIndex + 1);
        setIsTransitioning(false);
      } else {
        // Submit
        submitAnswers.mutate({
          sessionId,
          data: {
            partnerBToken,
            partnerName: name,
            answers: newAnswers
          }
        }, {
          onSuccess: (data) => {
            setLocation(`/verdict/${data.sessionId}`);
          },
          onError: () => {
            // Fallback just in case
            alert("The magic fizzled. This link might be invalid or already used.");
          }
        });
      }
    }, 1500);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isTransitioning) return;
    setIsTransitioning(true);
    setCatState('typing');
    setTimeout(() => {
      setCurrentIndex(currentQIndex + 1);
      setIsTransitioning(false);
    }, 1000);
  };

  const progress = (currentQIndex / PARTNER_B_QUESTIONS.length) * 100;

  if (!portalOpen) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scaleX: 0, height: '2px', backgroundColor: '#fff' }}
          animate={{ scaleX: 1, height: '100vh', backgroundColor: 'transparent' }}
          transition={{ duration: 1.5, times: [0, 0.5, 1], ease: "easeInOut" }}
          className="w-full absolute z-10 origin-center flex items-center justify-center shadow-[0_0_50px_#fff]"
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent blur-xl" />
        </motion.div>
      </div>
    );
  }

  return (
    <SceneTransition location={`/join/${partnerBToken}`}>
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 lg:p-8">
        <Particles />
        
        {/* Top Progress Bar */}
        <div className="fixed top-0 left-0 w-full p-6 z-20 flex flex-col items-center">
          <span className="text-xs uppercase tracking-[0.2em] text-gold/80 mb-2 font-heading">Evidence Collected</span>
          <div className="w-full max-w-md h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-gold shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        <div className="z-10 flex flex-col items-center w-full max-w-3xl pt-12">
          {/* The Cat */}
          <div className="mb-12 relative">
            <CatWizard state={catState} />
            
            {/* Speech Bubble */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ.id}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="absolute top-[-40px] md:top-[-60px] left-[60%] w-64 md:w-80 p-4 md:p-6 glass-panel rounded-2xl rounded-bl-none z-30"
              >
                <div className="serif-text text-lg md:text-xl text-white">
                  <Typewriter 
                    text={currentQ.question} 
                    speed={35} 
                    onComplete={handleTextComplete} 
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Answer Options */}
          <div className="w-full min-h-[250px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {questionTextComplete && !isTransitioning && (
                <motion.div
                  key={`opts-${currentQ.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="w-full"
                >
                  {currentQIndex === 0 ? (
                    <form onSubmit={handleNameSubmit} className="flex flex-col items-center w-full max-w-md mx-auto">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name..."
                        className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-6 py-4 text-xl text-center text-white placeholder:text-white/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                        autoFocus
                      />
                      <button 
                        type="submit"
                        disabled={!name.trim()}
                        className="mt-6 px-8 py-3 bg-white/5 border border-white/20 hover:border-gold hover:bg-gold/10 rounded-full text-white tracking-widest uppercase text-sm disabled:opacity-50 transition-all"
                      >
                        Speak
                      </button>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      {currentQ.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          className="glass-panel relative overflow-hidden group p-6 rounded-xl text-left transition-all hover:-translate-y-1 hover:border-gold hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                          <span className="relative z-10 text-lg md:text-xl font-medium text-white/90 group-hover:text-white">{opt}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </SceneTransition>
  );
}
