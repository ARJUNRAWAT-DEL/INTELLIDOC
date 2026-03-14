import PageShell from '../components/PageShell';
import ParallaxSection from '../components/ParallaxSection';
import InteractiveSlider from '../components/InteractiveSlider';
import InteractiveExploration from '../components/InteractiveExploration';
import InteractiveFeaturesShowcase from '../components/InteractiveFeaturesShowcase';
import SocialProof from '../components/SocialProof';
import FAQSection from '../components/FAQSection';
import StickyCTA from '../components/StickyCTA';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  return (
    <StickyCTA>
      <PageShell>
          {/* Hero Section */}
          <motion.section 
            className="relative pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden bg-gradient-to-b from-navy-primary to-navy-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-accent-neon-purple/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-tl from-accent-neon-cyan/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative max-w-6xl mx-auto px-6 lg:px-8 z-10">
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h1 className="text-display-xl font-display font-black text-text-primary mb-6">
                  How <span className="text-gradient">IntelliDoc Works</span>
                </h1>
                <p className="text-body-xl text-text-secondary max-w-2xl mx-auto">
                  A modern platform built for an immersive document intelligence experience. Explore interactive features that make document analysis intuitive, fast, and powerful.
                </p>
              </motion.div>

              {/* Quick Stats */}
              <motion.div 
                className="grid grid-cols-3 gap-4 md:gap-8 mt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {[
                  { label: 'Documents', value: '10K+' },
                  { label: 'Processing', value: '<2s' },
                  { label: 'Accuracy', value: '98%' },
                ].map((stat, idx) => (
                  <motion.div 
                    key={idx}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] text-center"
                    whileHover={{ y: -2 }}
                  >
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-neon-purple to-accent-neon-cyan">{stat.value}</p>
                    <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>

          {/* Interactive Features Showcase */}
          <InteractiveFeaturesShowcase />

          {/* How It Works - Step by Step */}
          <ParallaxSection />

          {/* Interactive Exploration */}
          <InteractiveExploration />

          {/* Features Slider */}
          <InteractiveSlider />

          {/* Social Proof Section */}
          <SocialProof />

          {/* FAQ Section */}
          <FAQSection />

          {/* CTA Section */}
          <motion.section 
            className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-navy-primary to-navy-secondary"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-gradient-to-br from-accent-neon-purple/20 to-transparent rounded-full blur-3xl -translate-y-1/2"></div>
            </div>

            <div className="relative max-w-4xl mx-auto px-6 lg:px-8 z-10">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-display-md font-display font-black text-text-primary mb-6">
                  Ready to Transform Your <span className="text-gradient">Document Workflow</span>?
                </h2>
                <p className="text-body-lg text-text-secondary mb-8 max-w-2xl mx-auto">
                  Join thousands of users who are saving hours every week with AI-powered document intelligence. Start your free trial today.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.button
                    className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors duration-200"
                    whileTap={{ scale: 0.97 }}
                  >
                    Start Free Trial
                  </motion.button>
                  <motion.button
                    className="px-8 py-4 rounded-xl border border-white/10 text-white/80 font-semibold hover:bg-white/5 hover:border-indigo-500/30 transition-all duration-200"
                    whileTap={{ scale: 0.97 }}
                  >
                    Schedule Demo
                  </motion.button>
                </div>

                {/* Trust indicators */}
                <motion.div
                  className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-text-secondary"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>14-day free trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Cancel anytime</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.section>
        </PageShell>
    </StickyCTA>
  );
}
