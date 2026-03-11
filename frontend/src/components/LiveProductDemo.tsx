import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdGetApp, MdCheckCircle, MdAutoAwesome } from 'react-icons/md';

const LiveProductDemo = () => {
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const steps = [
    {
      title: 'Upload Document',
      subtitle: 'Drag & drop your PDF, Word, or any file',
      icon: <MdGetApp />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'AI Processing',
      subtitle: 'Advanced NLP scanning & analysis',
      icon: <MdAutoAwesome />,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Summary Ready',
      subtitle: 'Get insights instantly',
      icon: <MdCheckCircle />,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const startDemo = async () => {
    setIsRunning(true);
    setStep(0);

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep(i + 1);
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRunning(false);
    setStep(0);
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Floating gradient blobs */}
      <motion.div
        className="absolute -top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl"
        animate={{ y: [0, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full blur-3xl"
        animate={{ y: [0, -50, 0] }}
        transition={{ duration: 12, repeat: Infinity, delay: 2 }}
      />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-display font-black mb-6">
            See It{' '}
            <span className="shimmer-text">
              In Action
            </span>
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Watch how IntelliDoc transforms your documents into actionable insights in real-time.
          </p>
        </motion.div>

        {/* Demo Container */}
        <motion.div
          className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-navy-secondary/50 to-navy-tertiary/50 border border-accent-neon-purple/20 backdrop-blur-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {/* Noise overlay */}
          <div className="absolute inset-0 noise-overlay pointer-events-none" />

          <div className="relative z-10">
            {/* Steps */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 mb-12">
              {steps.map((stepItem, idx) => (
                <motion.div
                  key={idx}
                  className={`p-4 rounded-2xl text-center transition-all ${
                    idx < step
                      ? `bg-gradient-to-br ${stepItem.color} text-white glow-active`
                      : idx === step && isRunning
                        ? `bg-gradient-to-br ${stepItem.color} text-white glow-active`
                        : 'bg-navy-secondary/50 border border-navy-tertiary text-text-secondary'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  animate={
                    idx === step && isRunning
                      ? {
                          scale: [1, 1.02, 1],
                          boxShadow: [
                            '0 0 20px rgba(154, 77, 255, 0.3)',
                            '0 0 40px rgba(154, 77, 255, 0.6)',
                            '0 0 20px rgba(154, 77, 255, 0.3)',
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="text-3xl mb-2 flex justify-center">{stepItem.icon}</div>
                  <h3 className="font-semibold line-clamp-2">{stepItem.title}</h3>
                  <p className="text-xs mt-1 opacity-80 line-clamp-2">{stepItem.subtitle}</p>
                </motion.div>
              ))}
            </div>

            {/* Progress Bar */}
            <motion.div
              className="mb-8 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex justify-between text-sm text-text-secondary mb-2">
                <span className="font-semibold">Processing Speed</span>
                <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  {isRunning ? 'Analyzing...' : 'Ready'}
                </motion.span>
              </div>
              <div className="h-2 bg-navy-tertiary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: isRunning ? `${(step / steps.length) * 100}%` : '0%' }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>

            {/* Sample Output */}
            <AnimatePresence>
              {step >= steps.length && !isRunning && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-2xl border border-green-500/30 mt-8"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <MdCheckCircle className="text-green-400 text-xl" />
                    <h4 className="font-semibold text-green-300">Summary Generated</h4>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    "The document discusses key findings about AI advancement. Main points: 1) 98% accuracy achieved, 2) Processing speed &lt;2 seconds, 3) Enterprise adoption 500+ teams, 4) Security compliance ready. Recommendations focus on implementation and scaling."
                  </p>
                  <div className="mt-4 flex gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-300">Confidence: 98%</span>
                    <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">8 Key Points</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Play Button */}
            <div className="flex justify-center mt-12">
              <motion.button
                onClick={startDemo}
                disabled={isRunning}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-accent-neon-purple to-accent-neon-cyan text-white font-semibold disabled:opacity-60 relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-accent-neon-cyan to-accent-neon-purple opacity-0 group-hover:opacity-50"
                  animate={{ x: ['100%', '-100%'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="relative flex items-center gap-2">
                  {isRunning ? '⏳ Running Demo...' : '▶️ Start Demo'}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Key Stats Below */}
        <motion.div
          className="grid grid-cols-3 gap-4 md:gap-8 mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {[
            { value: '<2s', label: 'Avg Processing' },
            { value: '98%', label: 'Accuracy' },
            { value: '∞', label: 'Scalable' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              className="text-center p-4 rounded-2xl bg-gradient-to-br from-navy-secondary/50 to-navy-tertiary/50 border border-accent-neon-purple/10"
              whileHover={{ scale: 1.05, borderColor: 'rgba(154, 77, 255, 0.5)' }}
            >
              <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-neon-purple to-accent-neon-cyan mb-1">
                {stat.value}
              </div>
              <p className="text-sm text-text-secondary">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LiveProductDemo;
