import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import ScreenshotCard from './ScreenshotCard';

const Hero = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
    },
  };

  // Track mouse for parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 50;
    const y = (e.clientY - rect.top - rect.height / 2) / 50;
    setMousePosition({ x, y });
  };

  return (
    <section className="relative py-20 md:py-28 lg:py-32 overflow-hidden">
      {/* === LAYER 1: Background Glows === */}
      {/* Soft blue glow behind heading (left side) */}
      <motion.div
        className="absolute -top-32 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ opacity: 0.15 }}
      />

      {/* Soft purple glow behind phone mockup (right side) */}
      <motion.div
        className="absolute -top-20 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"
        animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ opacity: 0.12 }}
      />

      {/* === LAYER 2: Subtle Grain Texture === */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /></filter><rect width="100" height="100" fill="%23000" filter="url(%23noise)" opacity="0.04" /></svg>')
          `,
          backgroundSize: '100px 100px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10" onMouseMove={handleMouseMove}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div 
            className="space-y-6 lg:col-span-3 lg:pr-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge - simple and clean */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 hover:border-indigo-500/60 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <motion.span 
                className="w-2 h-2 bg-indigo-400 rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm font-semibold text-indigo-300">Trusted by legal teams & enterprises</span>
            </motion.div>

            {/* === Main Heading with Gradient Animation === */}
            <motion.div variants={itemVariants}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 text-white" style={{ letterSpacing: '-0.02em' }}>
                Extract Insights from
                <motion.span
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    backgroundSize: '200% 200%',
                  }}
                >
                  Any Document
                </motion.span>
                in Seconds
              </h1>
            </motion.div>

            {/* Enhanced Description */}
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed"
            >
              Upload a 200-page contract and get a 2-minute summary instantly. IntelliDoc reads PDFs, legal documents, research papers — turning hours of reading into seconds of clarity.
            </motion.p>

            {/* === UPGRADED CTA Buttons === */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6"
            >
              {/* Primary Button with Glow & Arrow Animation */}
              <motion.button 
                onClick={() => navigate('/summarize')}
                className="group relative px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Outer glow on hover */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 blur-lg"
                  animate={{ opacity: [0, 0, 0] }}
                  whileHover={{ opacity: [0, 0.5, 0], transition: { duration: 1, repeat: Infinity } }}
                />
                {/* Button content */}
                <span className="relative flex items-center gap-2">
                  Try for Free
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>
              
              {/* Secondary Button - Glass Style */}
              <motion.button 
                className="px-8 py-4 rounded-lg backdrop-blur-md bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-indigo-400/40 transition-all"
                whileHover={{ scale: 1.05, borderColor: 'rgba(99, 102, 241, 0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Trust indicators - simple */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center gap-8 pt-10 border-t border-slate-700/50"
            >
              {[
                { value: '10K+', label: 'Documents' },
                { value: '98%', label: 'Accuracy' },
                { value: '<2s', label: 'Processing' },
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{stat.value}</div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* === Right: Phone Mockup with Enhancements === */}
          <motion.div 
            className="flex items-center justify-center lg:col-span-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Pulse Ring Effect (Bold Creative Element) */}
            <motion.div
              className="absolute w-96 h-96 rounded-full border border-purple-500/20 pointer-events-none"
              animate={{ scale: [1, 1.2, 1.3], opacity: [0.5, 0.2, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute w-80 h-80 rounded-full border border-purple-500/30 pointer-events-none"
              animate={{ scale: [1, 1.15, 1.25], opacity: [0.6, 0.3, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            />

            {/* Phone Mockup with Underglow & Effects */}
            <motion.div 
              className="relative"
              animate={{ 
                y: [0, -8, 0],
                rotateY: mousePosition.x * 0.5
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                transformPerspective: 1000,
                transform: `translateX(${mousePosition.x * 2}px) translateY(${mousePosition.y * 2}px)`,
              }}
            >
              {/* Underglow effect */}
              <motion.div
                className="absolute -inset-6 rounded-2xl bg-gradient-to-t from-purple-500/20 to-transparent blur-2xl pointer-events-none"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              />

              {/* Main card with reflection */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
                {/* Subtle reflection */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none rounded-2xl"
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 5, repeat: Infinity }}
                />
                
                <ScreenshotCard />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* === Section Divider === */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </section>
  );
};

export default Hero;
