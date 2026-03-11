import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdArrowForward, MdArrowBack } from 'react-icons/md';

interface Feature {
  id: number;
  title: string;
  description: string;
  benefit: string;
  gradient: string;
  icon: string;
}

const InteractiveSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const features: Feature[] = [
    {
      id: 0,
      title: '⚡ Lightning Fast Processing',
      description: 'Process documents in milliseconds',
      benefit: 'Get insights before you can finish your coffee',
      gradient: 'from-blue-500 to-cyan-500',
      icon: '⚡',
    },
    {
      id: 1,
      title: '🎯 Pinpoint Accuracy',
      description: 'Advanced NLP extracts exactly what matters',
      benefit: 'No more rereading or missed details',
      gradient: 'from-purple-500 to-pink-500',
      icon: '🎯',
    },
    {
      id: 2,
      title: '🔐 Enterprise Security',
      description: 'Your data stays yours, always encrypted',
      benefit: 'Peace of mind for sensitive documents',
      gradient: 'from-green-500 to-emerald-500',
      icon: '🔐',
    },
    {
      id: 3,
      title: '📚 Multi-Format Support',
      description: 'PDFs, Word docs, spreadsheets, and more',
      benefit: 'One tool for all your document needs',
      gradient: 'from-orange-500 to-red-500',
      icon: '📚',
    },
    {
      id: 4,
      title: '🤖 AI-Powered Intelligence',
      description: 'Understands context, not just keywords',
      benefit: 'Smarter summaries for better decisions',
      gradient: 'from-indigo-500 to-purple-500',
      icon: '🤖',
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoPlay, features.length]);

  const handlePrev = () => {
    setAutoPlay(false);
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const handleNext = () => {
    setAutoPlay(false);
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % features.length);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-navy-primary to-navy-secondary">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent-neon-purple/30 to-transparent"></div>
      
      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-accent-neon-purple/20 to-accent-neon-cyan/20 border border-accent-neon-purple/30 text-accent-neon-purple text-sm font-semibold mb-4">
            Features
          </span>
          <h2 className="text-display-md font-display font-black text-text-primary mb-4">
            <span className="text-gradient">Powerful Features</span> That Change Everything
          </h2>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            Swipe through to discover features that make document analysis faster, smarter, and more intuitive
          </p>
        </motion.div>

        {/* Interactive Slider */}
        <div className="relative">
          <div className="relative h-96 md:h-80 overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 },
                }}
                className="absolute inset-0"
              >
                <div className={`h-full bg-gradient-to-br ${features[currentSlide].gradient} rounded-3xl p-8 md:p-12 relative overflow-hidden group cursor-pointer`}>
                  {/* Animated background elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <div className="text-6xl mb-4">{features[currentSlide].icon}</div>
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {features[currentSlide].title}
                      </h3>
                      <p className="text-white/90 text-lg">
                        {features[currentSlide].description}
                      </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-white/80 text-sm font-semibold">💡 Why It Matters</p>
                      <p className="text-white mt-1">{features[currentSlide].benefit}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <motion.button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-20 p-3 rounded-full bg-glass-card border border-navy-secondary/30 hover:bg-glass-hover transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MdArrowBack className="w-6 h-6 text-accent-neon-purple" />
          </motion.button>

          <motion.button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-20 p-3 rounded-full bg-glass-card border border-navy-secondary/30 hover:bg-glass-hover transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MdArrowForward className="w-6 h-6 text-accent-neon-cyan" />
          </motion.button>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {features.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setAutoPlay(false);
                setDirection(idx > currentSlide ? 1 : -1);
                setCurrentSlide(idx);
                setTimeout(() => setAutoPlay(true), 10000);
              }}
              className={`transition-all duration-300 rounded-full ${
                idx === currentSlide 
                  ? 'bg-gradient-to-r from-accent-neon-purple to-accent-neon-cyan w-8 h-3' 
                  : 'bg-navy-secondary/30 w-3 h-3'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Instructions */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-text-secondary text-sm">
            🎯 Use arrows to navigate or click the dots. Auto-plays next slide in 5 seconds.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default InteractiveSlider;
