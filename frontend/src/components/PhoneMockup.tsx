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

              {showImage ? (
                <div className="w-full h-full relative pt-6">
                  <img
                    src={imageUrl}
                    alt="AI Document Intelligence Demo"
                    onError={() => setShowImage(false)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy-primary/40"></div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-6">
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
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-secondary to-navy-primary pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-r from-accent-neon-purple to-accent-neon-cyan flex items-center justify-center shadow-lg shadow-accent-neon-purple/40">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-xs text-text-muted font-medium">Document Preview</div>
                  </div>
                </div>
              )}

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
