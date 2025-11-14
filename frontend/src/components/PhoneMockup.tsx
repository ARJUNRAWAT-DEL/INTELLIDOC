import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PhoneMockupProps {
  imageUrl?: string;
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({ imageUrl = '/phone-demo.png' }) => {
  const [showImage, setShowImage] = useState(true);

  return (
    <motion.div
      className="relative w-36 sm:w-44 md:w-56 lg:w-64"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Soft glow behind phone */}
      <div className="absolute -z-10 blur-3xl bg-accent-neon-purple/20 w-[320px] h-[320px] rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>

      <div className="relative mx-auto" style={{ perspective: 1000 }}>
        <div
          className="relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-[36px] p-3 shadow-2xl"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="relative bg-black rounded-[32px] overflow-hidden" style={{ aspectRatio: '9/20' }}>
            <div className="relative w-full h-full bg-navy-primary rounded-[28px] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-navy-secondary to-navy-primary flex items-center justify-between px-4 z-20">
                <span className="text-xs font-semibold text-text-muted">9:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-2 border border-text-muted rounded-[1px]"></div>
                  <div className="w-1 h-1 bg-text-muted rounded-full"></div>
                </div>
              </div>

              {/* Always show content - no image loading */}
              <div className="w-full h-full relative pt-6 bg-gradient-to-br from-navy-secondary via-navy-primary to-navy-tertiary">
                {/* Document Preview Visual */}
                <div className="absolute inset-0 pt-10 px-4">
                  <div className="w-full space-y-3">
                    {/* Document Lines */}
                    <div className="h-2 bg-gradient-to-r from-accent-neon-purple/40 to-accent-neon-cyan/40 rounded-full w-3/4"></div>
                    <div className="h-2 bg-text-muted/20 rounded-full w-full"></div>
                    <div className="h-2 bg-text-muted/20 rounded-full w-5/6"></div>
                    <div className="h-2 bg-text-muted/20 rounded-full w-full"></div>
                    <div className="h-2 bg-text-muted/20 rounded-full w-4/5"></div>
                    
                    <div className="pt-3">
                      <div className="h-2 bg-text-muted/20 rounded-full w-full"></div>
                      <div className="h-2 bg-text-muted/20 rounded-full w-3/4 mt-2"></div>
                    </div>
                  </div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy-primary/60"></div>

                {/* Premium Text Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center gap-4 px-4 text-center">
                    <div className="text-sm sm:text-base md:text-lg font-bold text-text-primary leading-tight max-w-[85%]">
                      Your AI That Reads
                    </div>
                    <div className="text-xs sm:text-sm text-accent-neon-purple font-semibold">
                      So You Don't Have To
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute left-1/2 transform -translate-x-1/2 top-1 w-28 h-5 bg-slate-950 rounded-b-3xl z-30 shadow-lg"></div>
              <div className="absolute inset-0 rounded-[28px] opacity-[0.18] bg-gradient-to-br from-white/60 to-transparent pointer-events-none z-10"></div>
            </div>
          </div>

          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-gradient-to-t from-black/20 to-transparent rounded-full blur-lg"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default PhoneMockup;
