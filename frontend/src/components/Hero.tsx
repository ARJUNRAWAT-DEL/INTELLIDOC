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
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative py-section-lg md:py-section-lg lg:py-section-lg overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-10 w-96 h-96 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-full blur-3xl opacity-30 animate-float animation-delay-0"></div>
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-br from-accent-cyan/10 to-accent-blue/10 rounded-full blur-3xl opacity-20 animate-float animation-delay-2000"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-center">
          {/* Left content */}
          <motion.div 
            className="space-y-8 lg:col-span-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center space-x-2 px-4 py-2 glass-card"
            >
              <span className="w-2 h-2 bg-gradient-to-r from-accent-cyan to-accent-blue rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-gradient-start">AI-Powered Intelligence</span>
            </motion.div>

            {/* Main heading */}
            <motion.div variants={itemVariants}>
              <h1 className="text-display-lg font-display font-black leading-tight mb-6 text-white">
                Summarize Your
                <span className="block text-gradient"> Documents</span>
                <span className="block text-white">Instantly</span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p 
              variants={itemVariants}
              className="text-body-lg text-text-muted max-w-2xl leading-relaxed font-light"
            >
              Upload any file and get a clear, source-backed summary in seconds. IntelliDoc reads your PDFs, research papers, and documents — making complex information instantly accessible.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4"
            >
              <motion.button 
                onClick={() => navigate('/summarize')}
                className="group relative px-8 py-4 bg-gradient-button text-white font-bold rounded-xl shadow-premium hover:shadow-glow-blue transition-all duration-300 btn-premium flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
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
                className="px-6 py-4 text-text-gray font-semibold btn-secondary rounded-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                View Demo
              </motion.button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center gap-6 pt-8 border-t border-navy-700"
            >
              <motion.div whileHover={{ scale: 1.1 }}>
                <div className="text-2xl font-bold text-white">10K+</div>
                <p className="text-sm text-text-muted">Documents Processed</p>
              </motion.div>
              <div className="w-px h-8 bg-navy-700"></div>
              <motion.div whileHover={{ scale: 1.1 }}>
                <div className="text-2xl font-bold text-white">98%</div>
                <p className="text-sm text-text-muted">Accuracy Rate</p>
              </motion.div>
              <div className="w-px h-8 bg-navy-700"></div>
              <motion.div whileHover={{ scale: 1.1 }}>
                <div className="text-2xl font-bold text-white">&lt;2s</div>
                <p className="text-sm text-text-muted">Processing Time</p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right demo panel */}
          <motion.div 
            className="flex items-center justify-center lg:col-span-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div 
              className="relative"
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ScreenshotCard imageSrc={callersDemo} title="AI Summarization" subtitle="In Action" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
