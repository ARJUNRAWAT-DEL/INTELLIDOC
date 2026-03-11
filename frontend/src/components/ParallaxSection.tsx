import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MdCheckCircle } from 'react-icons/md';

const ParallaxSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setScrollY(rect.top);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps = [
    {
      number: '01',
      title: 'Upload Your Document',
      description: 'Simply drag and drop or select any PDF, Word, or text file',
      color: 'from-blue-500 to-cyan-500',
      icon: '📁',
    },
    {
      number: '02',
      title: 'AI Analysis in Progress',
      description: 'Our advanced AI instantly processes and understands your document',
      color: 'from-purple-500 to-pink-500',
      icon: '🤖',
    },
    {
      number: '03',
      title: 'Get Smart Summary',
      description: 'Receive a clear, concise summary with key insights highlighted',
      color: 'from-green-500 to-emerald-500',
      icon: '✨',
    },
    {
      number: '04',
      title: 'Search & Explore',
      description: 'Ask natural language questions and get instant answers backed by sources',
      color: 'from-orange-500 to-red-500',
      icon: '🔍',
    },
  ];

  return (
    <section ref={containerRef} className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-navy-secondary/50 to-navy-primary">
      <div className="absolute inset-0 overflow-hidden">
        {/* Parallax background elements */}
        <motion.div
          className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-accent-neon-purple/15 to-transparent rounded-full blur-3xl"
          style={{ y: scrollY * 0.3 }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-tl from-accent-neon-cyan/15 to-transparent rounded-full blur-3xl"
          style={{ y: scrollY * -0.3 }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-accent-neon-purple/20 to-accent-neon-cyan/20 border border-accent-neon-purple/30 text-accent-neon-purple text-sm font-semibold mb-4">
            How It Works
          </span>
          <h2 className="text-display-md font-display font-black text-text-primary mb-4">
            Simple Steps to <span className="text-gradient">Document Intelligence</span>
          </h2>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            Clear, straightforward process that takes you from document to insights in seconds
          </p>
        </motion.div>

        {/* Steps Timeline */}
        <div className="relative">
          {/* Vertical line (on desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent-neon-purple/50 to-accent-neon-cyan/50 transform -translate-x-1/2"></div>

          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                className={`relative ${
                  idx % 2 === 0 ? 'lg:pr-1/2 lg:text-right' : 'lg:pl-1/2 lg:text-left lg:ml-auto'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`flex gap-6 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Content Card */}
                  <div className="flex-1">
                    <motion.div
                      className={`p-6 md:p-8 rounded-2xl bg-gradient-to-br ${step.color} relative overflow-hidden group`}
                      whileHover={{ scale: 1.05, translateY: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                      <div className="relative z-10">
                        {/* Icon */}
                        <div className="text-4xl mb-4">{step.icon}</div>

                        {/* Step Number & Title */}
                        <div className="mb-3">
                          <p className="text-white/70 text-sm font-semibold mb-1">STEP {step.number}</p>
                          <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                        </div>

                        {/* Description */}
                        <p className="text-white/85 mb-4">{step.description}</p>

                        {/* Feature tags */}
                        <div className="flex flex-wrap gap-2">
                          {idx === 0 && <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium">Drag & Drop</span>}
                          {idx === 1 && <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium">Real-time</span>}
                          {idx === 2 && <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium">Instant</span>}
                          {idx === 3 && <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium">Accurate</span>}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Connector Circle (on desktop) */}
                  <motion.div
                    className="hidden lg:flex items-center justify-center"
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 + 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-neon-purple to-accent-neon-cyan flex items-center justify-center ring-4 ring-navy-primary z-10 shadow-xl">
                      <MdCheckCircle className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-accent-neon-purple to-accent-neon-cyan text-white font-semibold hover:shadow-2xl transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started Now
            <span className="text-xl">→</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default ParallaxSection;
