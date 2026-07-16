import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { CatWizard } from '@/components/cat-wizard';
import { Particles } from '@/components/particles';
import { SceneTransition } from '@/components/scene-transition';

export default function LandingPage() {
  return (
    <SceneTransition location="/">
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <Particles />
        
        {/* Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Main Content Container */}
        <div className="z-10 flex flex-col items-center max-w-4xl px-6 w-full mt-[-8vh]">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <CatWizard state="idle" mouseTracking={true} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold heading text-transparent bg-clip-text bg-gradient-to-b from-white to-gold gold-glow mb-6">
              The Court is now in session.
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground serif-text max-w-2xl mx-auto italic mb-12">
              "Every relationship tells two stories. <br/> The Cat listens to both."
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <Link href="/interrogate" className="group relative inline-flex items-center justify-center animate-float">
              {/* Button Glow */}
              <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative px-8 py-4 bg-card border-2 border-primary/50 rounded-full text-white font-semibold text-lg tracking-wide hover:border-gold hover:bg-primary/20 transition-all duration-300 overflow-hidden">
                <span className="relative z-10 flex items-center gap-3">
                  <span className="text-2xl">🐾</span> Enter The Court
                </span>
                
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </SceneTransition>
  );
}

// Add shimmer keyframe manually here or in CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes shimmer {
      100% { transform: translateX(100%); }
    }
  `;
  document.head.appendChild(style);
}
