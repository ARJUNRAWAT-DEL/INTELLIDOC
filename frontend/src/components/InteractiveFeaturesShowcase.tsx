import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdKey, MdSpeed, MdSmartToy, MdStorage, MdSecurity } from 'react-icons/md';

interface Capability {
  id: number;
  icon: React.ReactNode;
  title: string;
  shortDesc: string;
  fullDesc: string;
  benefits: string[];
  gradient: string;
  delay: number;
}

const InteractiveFeaturesShowcase = () => {
  const [expandedId, setExpandedId] = useState<number | null>(0);
  const [tiltRotation, setTiltRotation] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const capabilities: Capability[] = [
    {
      id: 0,
      icon: <MdSpeed className="w-8 h-8" />,
      title: '⚡ Lightning Speed',
      shortDesc: 'Process documents instantly',
      fullDesc: 'Get summaries in seconds, not hours. Our optimized AI processes documents at blazing speeds.',
      benefits: ['Sub-second response time', 'Batch processing', 'Real-time streaming'],
      gradient: 'from-blue-500 via-cyan-500 to-blue-400',
      delay: 0,
    },
    {
      id: 1,
      icon: <MdSmartToy className="w-8 h-8" />,
      title: '🤖 Smart AI',
      shortDesc: 'Context-aware understanding',
      fullDesc: 'Advanced NLP understands meaning, context, and nuance in your documents.',
      benefits: ['Context awareness', 'Entity recognition', 'Semantic search'],
      gradient: 'from-purple-500 via-pink-500 to-purple-400',
      delay: 0.1,
    },
    {
      id: 2,
      icon: <MdSecurity className="w-8 h-8" />,
      title: '🔐 Maximum Security',
      shortDesc: 'Enterprise-grade protection',
      fullDesc: 'End-to-end encryption keeps your sensitive documents completely private and secure.',
      benefits: ['End-to-end encryption', 'Zero data sharing', 'Compliance ready'],
      gradient: 'from-green-500 via-emerald-500 to-green-400',
      delay: 0.2,
    },
    {
      id: 3,
      icon: <MdStorage className="w-8 h-8" />,
      title: '💾 All Formats',
      shortDesc: 'Works with everything',
      fullDesc: 'PDF, Word, Excel, PowerPoint, TXT, and more. One tool handles it all.',
      benefits: ['Multiple formats', 'Smart extraction', 'Layout preservation'],
      gradient: 'from-orange-500 via-amber-500 to-orange-400',
      delay: 0.3,
    },
    {
      id: 4,
      icon: <MdKey className="w-8 h-8" />,
      title: '🎯 Precision Results',
      shortDesc: 'Accurate every time',
      fullDesc: 'Advanced algorithms ensure 98%+ accuracy in summaries and information extraction.',
      benefits: ['High accuracy', 'Source citations', 'Key phrase extraction'],
      gradient: 'from-indigo-500 via-purple-500 to-indigo-400',
      delay: 0.4,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-slate-950">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10">
        {/* Header - clean and simple */}
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Built for Enterprise
          </h2>
          <p className="text-lg text-slate-300">
            Speed, accuracy, security—all standard features. No compromises.
          </p>
        </motion.div>

        {/* Interactive Grid - using 3 cols instead of 5 for better prominence */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {capabilities.map((capability) => (
            <motion.div
              key={capability.id}
              onMouseMove={(e) => {
                if (hoveredId === capability.id) {
                  const card = e.currentTarget;
                  const rect = card.getBoundingClientRect();
                  const x = (e.clientY - rect.top - rect.height / 2) / 10;
                  const y = (e.clientX - rect.left - rect.width / 2) / 10;
                  setTiltRotation({ x, y });
                }
              }}
              onMouseEnter={() => setHoveredId(capability.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setExpandedId(expandedId === capability.id ? null : capability.id)}
              className="h-full group relative cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: capability.delay }}
              viewport={{ once: true }}
            >
              {/* Simplified Card */}
              <motion.div
                className={`h-full p-6 rounded-xl transition-all duration-300 relative overflow-hidden cursor-pointer
                  ${
                    expandedId === capability.id
                      ? 'bg-slate-800 border border-indigo-500/50'
                      : 'bg-slate-800/60 border border-slate-700 hover:border-indigo-500/30'
                  }`}
                whileHover={expandedId !== capability.id ? { scale: 1.02, borderColor: 'rgba(99, 102, 241, 0.5)' } : {}}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {/* Content */}
                <div className="relative flex flex-col h-full text-left z-10">
                  {/* Icon - keep it simple indigo */}
                  <motion.div
                    className="mb-3 text-2xl text-indigo-400"
                    animate={{
                      scale: expandedId === capability.id ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {capability.icon}
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white">
                    {capability.title}
                  </h3>

                  {/* Short Desc */}
                  <p className="text-sm mt-1 text-slate-300">
                    {capability.shortDesc}
                  </p>

                  {/* Expanded Content - clean and simple */}
                  {expandedId === capability.id && (
                    <motion.div
                      className="mt-6 space-y-4 flex-1 flex flex-col justify-between"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Full Description */}
                      <p className="text-sm text-slate-300">
                        {capability.fullDesc}
                      </p>

                      {/* Benefits List */}
                      <div className="space-y-2">
                        {capability.benefits.map((benefit, idx) => (
                          <motion.div
                            key={idx}
                            className="flex items-center gap-2 text-slate-300 text-sm"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.1 }}
                          >
                            <span className="text-indigo-400">✓</span>
                            <span>{benefit}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Simple CTA Button */}
                      <motion.button
                        className="mt-4 w-full py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Learn More
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Click indicator */}
                  {expandedId !== capability.id && (
                    <motion.div
                      className="mt-auto flex justify-center text-text-muted group-hover:text-accent-neon-purple transition-colors"
                      animate={{ y: [0, 3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-xs">Click to expand</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Info Section */}
        <motion.div
          className="mt-16 p-6 rounded-2xl bg-glass-card border border-navy-secondary/30 backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-text-secondary text-center">
            <span className="text-accent-neon-purple font-semibold">💡 Pro Tip:</span> Click on any capability card to see detailed features and benefits. All capabilities work together seamlessly to provide a complete document intelligence solution.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default InteractiveFeaturesShowcase;
