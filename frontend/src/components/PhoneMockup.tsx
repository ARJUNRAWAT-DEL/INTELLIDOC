import React from 'react';
import { motion } from 'framer-motion';

const PhoneMockup: React.FC = () => {

  return (
    <motion.div
      className="relative w-32 sm:w-40 md:w-48 lg:w-56"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* ✅ 2. Enhanced radial glow behind phone - violet to blue gradient */}
      <div 
        className="absolute -z-10 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(154, 77, 255, 0.25) 0%, rgba(79, 156, 255, 0.15) 50%, transparent 100%)',
          filter: 'blur(160px)',
        }}
      ></div>

      <div className="relative mx-auto" style={{ perspective: 1000 }}>
        <div
          className="relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-[36px] p-2 shadow-2xl"
          style={{
            boxShadow: '0 35px 85px rgba(154, 77, 255, 0.24), 0 20px 50px rgba(154, 77, 255, 0.15), 0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="relative bg-black rounded-[32px] overflow-hidden" style={{ aspectRatio: '9/20' }}>
            {/* ✅ 3. Inner glow with gradient for realistic screen depth */}
            <div className="relative w-full h-full rounded-[28px] overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #1c1c2a 0%, #0f0f17 100%)',
                boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-navy-secondary/80 to-transparent flex items-center justify-between px-4 z-20">
                <span className="text-xs font-semibold text-text-muted">9:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-2 border border-text-muted rounded-[1px]"></div>
                  <div className="w-1 h-1 bg-text-muted rounded-full"></div>
                </div>
              </div>

              {/* Always show content - no image loading */}
              <div className="w-full h-full relative pt-6 z-0">
                {/* ✅ 5. Document Preview Visual with shimmer animation */}
                <div className="absolute inset-0 pt-12 px-4 z-10 overflow-hidden">
                  <motion.div 
                    className="w-full space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                  >
                    {/* Document Lines with shimmer */}
                    <motion.div 
                      className="h-2.5 bg-gradient-to-r from-accent-neon-purple/70 to-accent-neon-cyan/60 rounded-full w-3/4 relative overflow-hidden"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                      />
                    </motion.div>
                    
                    {[100, 86, 100, 80, 100, 75].map((width, i) => (
                      <motion.div 
                        key={i}
                        className="h-2 bg-text-muted/35 rounded-full relative overflow-hidden"
                        style={{ width: `${width}%` }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2, delay: i * 0.2 }}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f0f17]/70 z-20"></div>

                {/* ✅ 7. Premium Text Overlay with improved contrast */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                  <motion.div 
                    className="flex flex-col items-center gap-3 px-4 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <div className="text-xs sm:text-sm md:text-base font-bold leading-tight max-w-[85%]"
                      style={{ 
                        color: 'rgba(255, 255, 255, 0.90)',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      Your AI That Reads
                    </div>
                    <div className="text-[10px] sm:text-xs font-semibold"
                      style={{ 
                        color: '#b49dff',
                        textShadow: '0 2px 6px rgba(180, 157, 255, 0.4)'
                      }}
                    >
                      So You Don't Have To
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* ✅ 4. Improved realistic notch with highlight and curvature */}
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 top-1 w-28 h-5 rounded-b-3xl z-40"
                style={{
                  background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="absolute top-0 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-gray-600/30 to-transparent"></div>
              </div>
              
              {/* ✅ 6. Glass reflection layer - diagonal gradient */}
              <div 
                className="absolute inset-0 rounded-[28px] pointer-events-none z-50"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
                  opacity: 0.15,
                }}
              ></div>
            </div>
          </div>

          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-gradient-to-t from-black/20 to-transparent rounded-full blur-lg"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default PhoneMockup;
