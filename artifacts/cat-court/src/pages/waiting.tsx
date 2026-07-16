import { useEffect, useState, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetSession, getGetSessionQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { CatWizard } from '@/components/cat-wizard';
import { Particles } from '@/components/particles';
import { SceneTransition } from '@/components/scene-transition';
import { Typewriter } from '@/components/typewriter';

export default function WaitingPage() {
  const params = useParams();
  const sessionId = params.sessionId!;
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  
  const { data: session } = useGetSession(sessionId, { 
    query: { 
      enabled: !!sessionId,
      queryKey: getGetSessionQueryKey(sessionId),
      refetchInterval: 3000 // Poll every 3 seconds to check if B joined/finished
    } 
  });

  const [textStage, setTextStage] = useState(0);

  useEffect(() => {
    if (session?.state === 'complete') {
      // Transition to verdict!
      setLocation(`/verdict/${sessionId}`);
    }
  }, [session?.state, sessionId, setLocation]);

  const inviteLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/join/${sessionId}/${session?.partnerBToken}`
    : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <SceneTransition location={`/waiting/${sessionId}`}>
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
        <Particles />
        
        <div className="z-10 flex flex-col items-center max-w-2xl w-full text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <CatWizard state="idle" />
          </motion.div>

          <div className="h-24 mb-8">
            <h2 className="text-2xl md:text-3xl font-serif text-white max-w-lg mx-auto leading-relaxed">
              {textStage === 0 && (
                <Typewriter text="I have heard one witness." onComplete={() => setTimeout(() => setTextStage(1), 1500)} />
              )}
              {textStage === 1 && (
                <Typewriter text="Truth has two voices." speed={60} onComplete={() => setTimeout(() => setTextStage(2), 500)} />
              )}
              {textStage === 2 && (
                <span>I have heard one witness. Truth has two voices.</span>
              )}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {textStage === 2 && session && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full flex flex-col items-center"
              >
                <div className="glass-panel p-8 rounded-2xl w-full relative overflow-hidden group border-gold/30">
                  <div className="absolute inset-0 bg-gold/5 blur-2xl rounded-full" />
                  
                  <p className="text-sm uppercase tracking-widest text-gold mb-6 font-heading relative z-10">
                    The Summons
                  </p>
                  
                  <div className="relative z-10 bg-black/50 border border-white/10 rounded-lg p-4 mb-6 break-all text-muted-foreground font-mono text-sm">
                    {inviteLink}
                  </div>
                  
                  <button 
                    onClick={copyLink}
                    className="relative z-10 w-full py-4 bg-primary hover:bg-primary/80 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                  >
                    {copied ? "Copied to Clipboard!" : "Copy Summons Link"}
                  </button>
                </div>
                
                <div className="mt-12 flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-t-2 border-r-2 border-gold rounded-full animate-spin" />
                  <p className="text-muted-foreground text-sm uppercase tracking-widest">
                    The Court Awaits
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </SceneTransition>
  );
}
