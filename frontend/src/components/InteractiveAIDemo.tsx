import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdCloudUpload, MdAutoAwesome, MdCheckCircle } from 'react-icons/md';

const InteractiveAIDemo = () => {
  const [demoStep, setDemoStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      title: 'Upload Document',
      description: 'Drag & drop any PDF, Word, or text file',
      icon: MdCloudUpload,
      progress: 0,
    },
    {
      title: 'AI Analyzing',
      description: 'Lightning-fast intelligent processing',
      icon: MdAutoAwesome,
      progress: 50,
    },
    {
      title: 'Summary Ready',
      description: 'Get instant, accurate insights',
      icon: MdCheckCircle,
      progress: 100,
    },
  ];

  const runDemo = async () => {
    setIsAnimating(true);
    for (let i = 0; i < steps.length; i++) {
      setDemoStep(i);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setDemoStep(0);
    setIsAnimating(false);
  };

  const currentStep = steps[demoStep];
  const Icon = currentStep.icon;

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
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
            INTERACTIVE DEMO
          </span>
          <h2 className="text-display-md font-display font-black text-text-primary mb-4">
            See <span className="text-gradient">Lightning Speed</span> in Action
          </h2>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            Watch how IntelliDoc processes documents faster than you can take a breath
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Demo Animation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="p-8 rounded-3xl bg-gradient-to-br from-navy-secondary to-navy-primary border border-navy-secondary/50 relative overflow-hidden">
              {/* Animated gradient background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-accent-neon-purple/10 to-accent-neon-cyan/10"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              />

              <div className="relative z-10">
                {/* Step Progress */}
                <motion.div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    {steps.map((step, idx) => (
                      <motion.div
                        key={idx}
                        className={`w-3 h-3 rounded-full transition-all ${
                          idx <= demoStep
                            ? 'bg-gradient-to-r from-accent-neon-purple to-accent-neon-cyan w-8'
                            : 'bg-navy-secondary/30'
                        }`}
                        animate={{
                          scale: idx === demoStep ? 1.2 : 1,
                        }}
                      />
                    ))}
                  </div>
                  <motion.div
                    className="h-1 bg-gradient-to-r from-accent-neon-purple to-accent-neon-cyan rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${currentStep.progress}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </motion.div>

                {/* Icon Animation */}
                <motion.div
                  className="flex justify-center mb-8"
                  key={demoStep}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <motion.div
                    className="p-6 rounded-2xl bg-gradient-to-br from-accent-neon-purple/20 to-accent-neon-cyan/20 border border-accent-neon-purple/30"
                    animate={{
                      y: [0, -10, 0],
                      boxShadow: [
                        '0 0 20px rgba(154, 77, 255, 0.2)',
                        '0 0 40px rgba(154, 77, 255, 0.4)',
                        '0 0 20px rgba(154, 77, 255, 0.2)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Icon className="w-12 h-12 text-gradient-to-r from-accent-neon-purple to-accent-neon-cyan" />
                  </motion.div>
                </motion.div>

                {/* Step Info */}
                <motion.div
                  className="text-center"
                  key={demoStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-2xl font-bold text-text-primary mb-2">
                    {currentStep.title}
                  </h3>
                  <p className="text-text-secondary">{currentStep.description}</p>
                </motion.div>

                {/* Sample Result */}
                {demoStep === 2 && (
                  <motion.div
                    className="mt-8 p-4 rounded-xl bg-glass-card border border-accent-neon-purple/30"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-xs text-accent-neon-cyan font-semibold mb-2">📄 Sample Output</p>
                    <p className="text-sm text-text-secondary line-clamp-3">
                      ✨ Key findings summarized • 🎯 Main points extracted • 📊 Statistics highlighted • 🔍 Questions answered
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right: Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="space-y-4">
              {[
                {
                  title: 'Instant Processing',
                  desc: 'Submits within milliseconds',
                  icon: '⚡',
                },
                {
                  title: 'Accurate Extraction',
                  desc: '98% precision on key information',
                  icon: '🎯',
                },
                {
                  title: 'Multiple Formats',
                  desc: 'PDF, Word, Text, Excel & more',
                  icon: '📎',
                },
                {
                  title: 'Real-time Results',
                  desc: 'Answers before you think of questions',
                  icon: '🚀',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="flex gap-4 p-4 rounded-xl bg-glass-card border border-navy-secondary/30 hover:border-accent-neon-purple/50 transition-colors"
                  whileHover={{ scale: 1.02, x: 5 }}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-2xl flex-shrink-0">{item.icon}</div>
                  <div>
                    <h4 className="font-semibold text-text-primary">{item.title}</h4>
                    <p className="text-sm text-text-secondary">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.button
              onClick={runDemo}
              disabled={isAnimating}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-accent-neon-purple to-accent-neon-cyan text-white font-semibold hover:shadow-2xl transition-shadow disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isAnimating ? 'Processing...' : '▶ Play Demo'}
            </motion.button>

            <p className="text-xs text-text-muted text-center">
              This is a live simulation. Click play to see it in action.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveAIDemo;
