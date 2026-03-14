import { useRef } from 'react';
import { motion } from 'framer-motion';
import { MdCloudUpload, MdAutoAwesome, MdArticle, MdManageSearch } from 'react-icons/md';

const ParallaxSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      number: '01',
      title: 'Upload Your Document',
      description: 'Drag and drop or select any PDF, Word, or text file. Supports documents up to 200 pages.',
      icon: <MdCloudUpload className="w-5 h-5" />,
      tag: 'Drag & Drop',
    },
    {
      number: '02',
      title: 'AI Analysis',
      description: 'Advanced AI processes your document, extracts entities, and maps key relationships instantly.',
      icon: <MdAutoAwesome className="w-5 h-5" />,
      tag: 'Real-time',
    },
    {
      number: '03',
      title: 'Get Smart Summary',
      description: 'Receive a concise summary with critical clauses, key insights, and action items surfaced.',
      icon: <MdArticle className="w-5 h-5" />,
      tag: 'Instant',
    },
    {
      number: '04',
      title: 'Search & Explore',
      description: 'Ask natural language questions and get precise answers with cited source passages.',
      icon: <MdManageSearch className="w-5 h-5" />,
      tag: 'Accurate',
    },
  ];

  return (
    <section ref={containerRef} className="relative py-20 md:py-32 overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-3 py-1 rounded-full border border-indigo-500/30 text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-5">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Simple Steps to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-300">
              Document Intelligence
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            From upload to insight in under two seconds.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className="group relative p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/25 hover:bg-white/[0.04] transition-all duration-300 cursor-default"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
            >
              {/* Top accent line */}
              <div className="w-8 h-px bg-indigo-500/40 mb-5 group-hover:w-12 group-hover:bg-indigo-400/60 transition-all duration-300" />

              {/* Icon + Number row */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/15 group-hover:border-indigo-500/30 transition-colors duration-300">
                  {step.icon}
                </div>
                <span className="text-3xl font-bold text-white/[0.05]">{step.number}</span>
              </div>

              {/* Content */}
              <h3 className="text-base font-semibold text-white mb-2 leading-snug">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">{step.description}</p>

              {/* Tag */}
              <span className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-white/[0.03] border border-white/[0.06] text-slate-500 group-hover:border-indigo-500/20 group-hover:text-indigo-400 transition-colors duration-300">
                {step.tag}
              </span>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <button className="inline-flex items-center gap-2.5 px-7 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors duration-200">
            Get Started
            <span>→</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ParallaxSection;
