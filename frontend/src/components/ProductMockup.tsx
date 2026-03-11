import { motion } from 'framer-motion';
import { Upload, CheckCircle2, FileText } from 'lucide-react';

export default function ProductMockup() {
  const steps = [
    {
      icon: Upload,
      title: 'Upload',
      description: 'Drag and drop PDFs, contracts, or documents'
    },
    {
      icon: FileText,
      title: 'Process',
      description: 'AI analyzes in seconds'
    },
    {
      icon: CheckCircle2,
      title: 'Get Insights',
      description: 'Key points, risks, summaries'
    }
  ];

  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Powerful, Instant
          </h2>
          <p className="text-lg text-slate-300">
            From 200-page contracts to instant summaries in seconds. See how it works.
          </p>
        </motion.div>

        {/* Desktop mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Product preview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
              {/* Browser header */}
              <div className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="ml-4 text-xs text-slate-500">intellidoc.ai/summarize</div>
              </div>

              {/* Main content area */}
              <div className="p-8 min-h-96 bg-slate-800/50">
                <div className="space-y-6">
                  {/* Upload area */}
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-indigo-500/50 transition-colors">
                    <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-white font-medium">Drag PDF or press to upload</p>
                    <p className="text-sm text-slate-400 mt-1">Supports PDFs, Word docs, contract files</p>
                  </div>

                  {/* Summary preview (example output) */}
                  <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                    <div className="flex items-start gap-3 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-500/70 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-white text-sm mb-1">Summary Ready</p>
                        <p className="text-sm text-slate-400">Processed in 2.34 seconds</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-300"><strong>Key Points:</strong></p>
                      <ul className="text-slate-400 space-y-1 ml-4 list-disc">
                        <li>Payment terms extended to Net-60</li>
                        <li>Liability cap at $500k</li>
                        <li>Termination clause effective in 30 days</li>
                      </ul>
                    </div>
                  </div>

                  {/* Stats bar */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-900/80 rounded p-3 border border-slate-700 text-center">
                      <p className="text-indigo-400 font-bold">98%</p>
                      <p className="text-xs text-slate-400">Accuracy</p>
                    </div>
                    <div className="bg-slate-900/80 rounded p-3 border border-slate-700 text-center">
                      <p className="text-indigo-400 font-bold">2s</p>
                      <p className="text-xs text-slate-400">Avg Time</p>
                    </div>
                    <div className="bg-slate-900/80 rounded p-3 border border-slate-700 text-center">
                      <p className="text-indigo-400 font-bold">∞</p>
                      <p className="text-xs text-slate-400">Docs/mo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle shadow accent */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 to-cyan-500/0 pointer-events-none" />
          </motion.div>

          {/* Right: Steps explanation */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-500/20 border border-indigo-500/40">
                      <Icon className="w-6 h-6 text-indigo-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg mb-1">
                      {step.title}
                    </h3>
                    <p className="text-slate-400">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-10 pt-8 border-t border-slate-700"
            >
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
                Try It Free
                <span className="text-lg">→</span>
              </button>
              <p className="text-sm text-slate-400 mt-3">No credit card required</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
