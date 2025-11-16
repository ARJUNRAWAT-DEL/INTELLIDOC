import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PhoneMockup: React.FC = () => {
  const [demoStep, setDemoStep] = useState<'upload' | 'preview' | 'analyzing' | 'summary'>('upload');

  useEffect(() => {
    const sequence = async () => {
      // Step 1: Upload (0.8s)
      await new Promise(resolve => setTimeout(resolve, 800));
      setDemoStep('preview');
      
      // Step 2: Preview (0.6s)
      await new Promise(resolve => setTimeout(resolve, 600));
      setDemoStep('analyzing');
      
      // Step 3: Analyzing (1s)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDemoStep('summary');
      
      // Step 4: Summary (2s) then loop
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDemoStep('upload');
    };

    sequence();
    const interval = setInterval(sequence, 5400); // Total loop time
    
    return () => clearInterval(interval);
  }, []);

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

              {/* Micro UI Demo - Upload → Summarize Flow */}
              <div className="w-full h-full relative pt-6 z-0">
                <AnimatePresence mode="wait">
                  {/* Step 1: Upload Button */}
                  {demoStep === 'upload' && (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center z-30"
                    >
                      <motion.button
                        className="px-6 py-3 bg-gradient-to-r from-accent-neon-purple to-accent-neon-cyan rounded-xl font-semibold text-white shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          boxShadow: '0 4px 20px rgba(154, 77, 255, 0.4)',
                        }}
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Upload File
                        </div>
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Step 2: File Preview */}
                  {demoStep === 'preview' && (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 pt-12 px-4 z-10"
                    >
                      <div className="bg-navy-secondary/80 backdrop-blur-sm rounded-lg p-3 border border-accent-neon-purple/30">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-8 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
                            PDF
                          </div>
                          <div className="flex-1">
                            <div className="text-white text-xs font-semibold">Research_Paper.pdf</div>
                            <div className="text-text-muted text-[10px]">2.4 MB • 24 pages</div>
                          </div>
                        </div>
                        <div className="space-y-1.5 mt-3">
                          {[100, 95, 100, 88, 100, 92].map((width, i) => (
                            <motion.div
                              key={i}
                              className="h-1.5 bg-text-muted/25 rounded-full"
                              style={{ width: `${width}%` }}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: AI Analyzing */}
                  {demoStep === 'analyzing' && (
                    <motion.div
                      key="analyzing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center z-30"
                    >
                      <div className="text-center">
                        <motion.div
                          className="relative w-16 h-16 mx-auto mb-3"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <div className="absolute inset-0 border-4 border-accent-neon-purple/30 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-transparent border-t-accent-neon-purple border-r-accent-neon-cyan rounded-full"></div>
                        </motion.div>
                        <motion.div
                          className="text-white font-semibold text-xs"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          AI Summarizing...
                        </motion.div>
                        <div className="text-text-muted text-[10px] mt-1">Reading 24 pages</div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Summary Result */}
                  {demoStep === 'summary' && (
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 pt-10 px-4 z-10 overflow-hidden"
                    >
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="bg-gradient-to-br from-accent-neon-purple/20 to-accent-neon-cyan/20 backdrop-blur-md rounded-lg p-3 border border-accent-neon-purple/40"
                        style={{
                          boxShadow: '0 8px 32px rgba(154, 77, 255, 0.3)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="w-6 h-6 bg-gradient-to-br from-accent-neon-purple to-accent-neon-cyan rounded-full flex items-center justify-center"
                          >
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                          <span className="text-white font-bold text-xs">Summary Ready</span>
                        </div>
                        
                        <div className="space-y-2 mt-2">
                          {[
                            { text: 'Key findings on neural networks', delay: 0.1 },
                            { text: 'Three breakthrough methodologies', delay: 0.2 },
                            { text: '94% accuracy improvement shown', delay: 0.3 },
                          ].map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: item.delay }}
                              className="flex items-start gap-1.5"
                            >
                              <div className="w-1 h-1 rounded-full bg-accent-neon-cyan mt-1 flex-shrink-0"></div>
                              <span className="text-text-primary text-[10px] leading-relaxed">{item.text}</span>
                            </motion.div>
                          ))}
                        </div>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="mt-3 pt-2 border-t border-white/10"
                        >
                          <div className="text-[9px] text-text-muted">Summarized in 2.3s • 24 pages → 3 insights</div>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f0f17]/70 z-0 pointer-events-none"></div>
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
