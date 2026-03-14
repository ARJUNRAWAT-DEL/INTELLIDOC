import { motion } from 'framer-motion';
import { MdStar } from 'react-icons/md';

const SocialProof = () => {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Research Director',
      company: 'TechVenture Labs',
      avatar: '👩‍💼',
      text: 'IntelliDoc cut our research time in half. What used to take hours now takes minutes.',
      rating: 5,
    },
    {
      name: 'Marcus Johnson',
      role: 'Legal Counsel',
      company: 'GlobalTech Partners',
      avatar: '👨‍⚖️',
      text: 'The accuracy is incredible. We rely on it for contract analysis every single day.',
      rating: 5,
    },
    {
      name: 'Elena Rodriguez',
      role: 'Product Manager',
      company: 'DataFlow Systems',
      avatar: '👩‍💻',
      text: 'Our team loves it. The interface is intuitive and results are spot-on.',
      rating: 5,
    },
  ];

  const stats = [
    { number: '10K+', label: 'Documents Processed', icon: '📄' },
    { number: '500+', label: 'Teams Trusting', icon: '👥' },
    { number: '98%', label: 'Accuracy Rate', icon: '🎯' },
    { number: '<2s', label: 'Processing Time', icon: '⚡' },
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
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl bg-accent-neon-purple/10"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 z-10">
        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="text-center p-6 rounded-2xl bg-glass-card border border-navy-secondary/30 hover:border-accent-neon-purple/50 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl md:text-4xl mb-2">{stat.icon}</div>
              <motion.div
                className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-neon-purple to-accent-neon-cyan mb-1"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                {stat.number}
              </motion.div>
              <p className="text-xs md:text-sm text-text-secondary">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-accent-neon-purple/20 to-accent-neon-cyan/20 border border-accent-neon-purple/30 text-accent-neon-purple text-sm font-semibold mb-4">
            TRUSTED BY TEAMS WORLDWIDE
          </span>
          <h2 className="text-display-md font-display font-black text-text-primary mb-4">
            What Our Users Say
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="relative p-6 rounded-2xl bg-glass-card border border-navy-secondary/30 hover:border-accent-neon-purple/50 transition-colors group"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-neon-purple/0 to-accent-neon-cyan/0 group-hover:from-accent-neon-purple/5 group-hover:to-accent-neon-cyan/5 transition-colors" />

              <div className="relative z-10">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <MdStar className="w-5 h-5 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-text-secondary mb-6 italic">"{testimonial.text}"</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-semibold text-text-primary text-sm">{testimonial.name}</p>
                    <p className="text-xs text-text-muted">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Company Logos / Social Proof */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-text-muted text-sm mb-6">TRUSTED BY LEADING ORGANIZATIONS</p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {['TechVenture', 'GlobalTech', 'DataFlow', 'CloudBase', 'AI Labs'].map((company, idx) => (
              <motion.div
                key={idx}
                className="px-4 py-2 rounded-lg border border-navy-secondary/30 text-text-muted text-sm font-semibold hover:border-accent-neon-purple/50 transition-colors"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                {company}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;
