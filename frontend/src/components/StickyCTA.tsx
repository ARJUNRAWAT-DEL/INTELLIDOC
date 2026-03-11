import { motion } from 'framer-motion';
import { MdArrowForward } from 'react-icons/md';
import React from 'react';

interface StickyCTAProps {
  children?: React.ReactNode;
}

const StickyCTA: React.FC<StickyCTAProps> = ({ children }) => {
  const [isVisible, setIsVisible] = React.useState(true);

  return (
    <div className="relative">
      {children}
      
      {isVisible && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-navy-primary via-navy-primary to-transparent pt-8 pb-6 px-6"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6 rounded-2xl bg-gradient-to-r from-accent-neon-purple/20 to-accent-neon-cyan/20 border border-accent-neon-purple/30 backdrop-blur-xl"
              whileHover={{ scale: 1.01 }}
            >
              {/* Left: Message */}
              <div className="flex-1 flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-2xl">⚡</span>
                </motion.div>
                <div>
                  <p className="font-semibold text-text-primary">
                    🎉 Get 50% off with annual plan + Free month today only
                  </p>
                  <p className="text-sm text-text-secondary">
                    Limited offer: 14-day free trial, no credit card required
                  </p>
                </div>
              </div>

              {/* Right: CTA */}
              <div className="flex gap-3 w-full md:w-auto">
                <motion.button
                  className="flex-1 md:flex-none px-6 py-3 rounded-lg bg-gradient-to-r from-accent-neon-purple to-accent-neon-cyan text-white font-semibold hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started Free
                  <MdArrowForward className="w-4 h-4" />
                </motion.button>
                <motion.button
                  className="px-4 py-3 rounded-lg border border-text-secondary/30 text-text-secondary hover:bg-glass-card transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsVisible(false)}
                >
                  ✕
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StickyCTA;
