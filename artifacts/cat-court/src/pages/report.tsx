import { useRef, useEffect } from 'react';
import { useParams } from 'wouter';
import { motion } from 'framer-motion';
import { useGetVerdict, getGetVerdictQueryKey } from '@workspace/api-client-react';
import { Particles } from '@/components/particles';
import { SceneTransition } from '@/components/scene-transition';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { Download, Share2 } from 'lucide-react';

export default function ReportPage() {
  const params = useParams();
  const sessionId = params.sessionId!;
  
  const { data: verdict, isLoading } = useGetVerdict(sessionId, {
    query: { enabled: !!sessionId, queryKey: getGetVerdictQueryKey(sessionId) }
  });

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (verdict) {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#7c3aed', '#f59e0b', '#ffffff']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#7c3aed', '#f59e0b', '#ffffff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [verdict]);

  const handleDownload = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#0a0015',
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `cat-court-judgment-${verdict?.partnerAName}-${verdict?.partnerBName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Our Cat Court Judgment',
          text: `The Cat Wizard has judged ${verdict?.partnerAName} and ${verdict?.partnerBName}. Alignment Score: ${verdict?.alignmentScore}%!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      alert("Sharing is not supported on this browser. Try downloading the image instead!");
    }
  };

  if (isLoading || !verdict) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <SceneTransition location={`/report/${sessionId}`}>
      <div className="relative min-h-screen py-12 px-4 flex flex-col items-center">
        <Particles />
        
        {/* Actions Bar */}
        <div className="z-20 flex gap-4 mb-8 sticky top-4">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white font-medium border border-white/20 transition-all shadow-lg"
          >
            <Download size={18} /> Save Judgment
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 backdrop-blur-md rounded-full text-white font-medium shadow-[0_0_15px_rgba(124,58,237,0.5)] transition-all"
          >
            <Share2 size={18} /> Share Story
          </button>
        </div>

        {/* The Report (Target for html2canvas) */}
        <div className="z-10 w-full flex justify-center">
          <motion.div 
            ref={reportRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="w-full max-w-[400px] md:max-w-[500px] aspect-[9/16] bg-card relative rounded-3xl overflow-hidden shadow-2xl border-[4px] border-gold border-double"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%237c3aed' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundSize: '100px 100px'
            }}
          >
            {/* Top Seal */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
            <div className="mt-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(245,158,11,0.5)] border-[3px] border-[#8b4513]">
                ⚖️
              </div>
              <h1 className="text-2xl mt-4 font-heading text-gold uppercase tracking-[0.2em] gold-glow">
                Cat Court
              </h1>
              <p className="text-sm font-serif text-white/70 italic mt-1">Official Judgment Record</p>
            </div>

            {/* Couple Intro */}
            <div className="mt-6 px-8 text-center">
              <h2 className="text-xl md:text-2xl font-serif text-white break-words">
                {verdict.partnerAName} <span className="text-primary mx-2">&</span> {verdict.partnerBName}
              </h2>
            </div>

            {/* Alignment Score */}
            <div className="mt-8 px-8 w-full flex flex-col items-center">
              <p className="text-xs uppercase tracking-widest text-gold mb-2">Cosmic Alignment</p>
              <div className="relative w-48 h-4 bg-black/50 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-gold shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  style={{ width: `${verdict.alignmentScore}%` }}
                />
              </div>
              <p className="text-3xl font-heading text-white mt-3 gold-glow">{verdict.alignmentScore}%</p>
            </div>

            {/* Compact Cards List */}
            <div className="mt-8 px-6 pb-12 flex-1 overflow-y-auto no-scrollbar space-y-4">
              {verdict.cards.map((card, i) => (
                <div key={i} className="bg-black/30 border border-white/5 p-4 rounded-xl flex gap-4 items-center">
                  <div className="text-3xl">{card.emoji}</div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-gold mb-1">{card.type.replace('_', ' ')}</h4>
                    <p className="text-sm font-serif text-white/90">{card.title}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer */}
            <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent text-center">
              <p className="text-xs text-white/30 font-mono">COURT_SESSION: {sessionId.substring(0, 8)}</p>
            </div>
          </motion.div>
        </div>
        
      </div>
    </SceneTransition>
  );
}
