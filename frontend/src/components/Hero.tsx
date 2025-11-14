import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ScreenshotCard from './ScreenshotCard';
import callersDemo from '../assets/callers-demo.svg';

const Hero = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative py-section-lg md:py-section-lg lg:py-section-lg overflow-hidden">
      {/* Animated background glows - Midnight Neon style */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-accent-neon-purple/30 to-glow-purple/25 rounded-full blur-3xl opacity-50 animate-float animation-delay-0 pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-gradient-to-br from-glow-cyan/25 to-accent-neon-purple/15 rounded-full blur-3xl opacity-40 animate-float animation-delay-2000 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Left content - More left padding */}
          <motion.div 
            className="space-y-6 lg:col-span-3 lg:pr-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center space-x-2 px-4 py-2 glass-card"
            >
              <span className="w-2 h-2 bg-gradient-to-r from-accent-neon-purple to-accent-neon-cyan rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-accent-neon-purple">AI-Powered Intelligence</span>
            </motion.div>

            {/* Main heading with premium gradient */}
            <motion.div variants={itemVariants}>
              <h1 className="text-display-lg font-display font-black leading-tight mb-4 text-text-primary" style={{ letterSpacing: '-0.5px' }}>
                Summarize Your
                <span className="block text-gradient"> Documents</span>
                <span className="block text-text-primary">Instantly</span>
              </h1>
            </motion.div>

            {/* Description - tighter spacing */}
            <motion.p 
              variants={itemVariants}
              className="text-body-lg text-text-secondary max-w-2xl leading-relaxed font-light"
            >
              Upload any file and get a clear, source-backed summary in seconds. IntelliDoc reads your PDFs, research papers, and documents — making complex information instantly accessible.
            </motion.p>

            {/* CTA Buttons - increased spacing after paragraph */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6"
            >
              <motion.button 
                onClick={() => navigate('/summarize')}
                className="button-primary"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Start Summarizing</span>
                <motion.svg 
                  className="w-5 h-5"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </motion.button>
              
              <motion.button 
                className="button-secondary"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
              >
                View Demo
              </motion.button>
            </motion.div>

            {/* Trust indicators - increased spacing from buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center gap-8 pt-10 border-t border-navy-secondary/50"
            >
              <motion.div whileHover={{ scale: 1.1 }}>
                <div className="text-2xl font-bold text-text-primary">10K+</div>
                <p className="text-sm text-text-muted">Documents Processed</p>
              </motion.div>
              <div className="w-px h-10 bg-navy-secondary/30"></div>
              <motion.div whileHover={{ scale: 1.1 }}>
                <div className="text-2xl font-bold text-text-primary">98%</div>
                <p className="text-sm text-text-muted">Accuracy Rate</p>
              </motion.div>
              <div className="w-px h-10 bg-navy-secondary/30"></div>
              <motion.div whileHover={{ scale: 1.1 }}>
                <div className="text-2xl font-bold text-text-primary">&lt;2s</div>
                <p className="text-sm text-text-muted">Processing Time</p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right demo panel - floating animation */}
          <motion.div 
            className="flex items-center justify-center lg:col-span-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div 
              className="relative drop-shadow-2xl"
              style={{
                filter: 'drop-shadow(0 20px 50px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 60px rgba(154, 77, 255, 0.3))',
              }}
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div style={{ borderRadius: '24px', overflow: 'hidden' }}>
                <ScreenshotCard imageSrc={callersDemo} title="AI Summarization" subtitle="In Action" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
