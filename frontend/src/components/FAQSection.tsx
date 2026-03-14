import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdExpandMore } from 'react-icons/md';

const FAQSection = () => {
  const [expanded, setExpanded] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How accurate is IntelliDoc compared to manual reading?',
      answer: 'IntelliDoc achieves 98% accuracy using advanced NLP. While it won\'t catch every subtle detail, it reliably extracts key information 2-3x faster than manual review.',
    },
    {
      question: 'What file formats are supported?',
      answer: 'We support PDF, Microsoft Word (.docx), Excel (.xlsx), PowerPoint (.pptx), and plain text files. We automatically handle scanned PDFs and images within documents.',
    },
    {
      question: 'How secure is my data?',
      answer: 'Your documents are encrypted end-to-end with military-grade AES-256 encryption. We don\'t train on your data, and you can delete everything anytime. GDPR & HIPAA compliant.',
    },
    {
      question: 'Can I use IntelliDoc offline?',
      answer: 'The web app requires internet for cloud processing. However, our enterprise plan includes optional on-premises deployment with offline capabilities.',
    },
    {
      question: 'What\'s the pricing after the free trial?',
      answer: 'We offer flexible plans starting at $29/month for individuals, $99/month for teams. Enterprise pricing available. All plans include unlimited storage and document processing.',
    },
    {
      question: 'How long before I see ROI?',
      answer: 'Most teams see ROI within 2 weeks by reducing document review time. Customers report saving 10-15 hours per week on average. Your mileage may vary.',
    },
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="relative max-w-3xl mx-auto px-6 lg:px-8 z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-accent-neon-purple/20 to-accent-neon-cyan/20 border border-accent-neon-purple/30 text-accent-neon-purple text-sm font-semibold mb-4">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-display-md font-display font-black text-text-primary mb-4">
            Got Questions? <span className="text-gradient">We've Got Answers</span>
          </h2>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            Everything you need to know about IntelliDoc
          </p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              viewport={{ once: true }}
            >
              <motion.button
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                className="w-full p-6 rounded-2xl bg-glass-card border border-navy-secondary/30 hover:border-accent-neon-purple/50 transition-colors text-left group"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-text-primary group-hover:text-accent-neon-purple transition-colors pr-4">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: expanded === idx ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <MdExpandMore className="w-6 h-6 text-accent-neon-purple" />
                  </motion.div>
                </div>
              </motion.button>

              <AnimatePresence>
                {expanded === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 bg-gradient-to-br from-navy-secondary/50 to-navy-primary/50 border-x border-b border-navy-secondary/30 rounded-b-2xl">
                      <p className="text-text-secondary leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-accent-neon-purple/10 to-accent-neon-cyan/10 border border-accent-neon-purple/30 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
            Still have questions?
          </h3>
          <p className="text-text-secondary mb-6">
            Our support team is here to help. Reach out anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-accent-neon-purple to-accent-neon-cyan text-white font-semibold hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Contact Support
            </motion.button>
            <motion.button
              className="px-6 py-3 rounded-lg border border-accent-neon-purple/30 text-accent-neon-purple font-semibold hover:bg-glass-card transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Schedule a Demo
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
