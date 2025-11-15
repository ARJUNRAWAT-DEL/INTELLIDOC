import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ContactPersonal: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: open mail client
    window.location.href = `mailto:arjun@example.com?subject=${encodeURIComponent('Contact from IntelliDoc')}&body=${encodeURIComponent(`${name} (${email})\n\n${message}`)}`;
  };

  return (
    <div className="relative py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-4 py-2 glass-card mb-6"
          >
            <span className="w-2 h-2 bg-gradient-to-r from-accent-neon-purple to-accent-neon-cyan rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold text-accent-neon-purple">Let's Connect</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-black text-text-primary mb-6 font-display">
            Get in <span className="text-gradient">Touch</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Have questions about IntelliDoc? Want to collaborate? Feel free to reach out — this form opens your email client for demo purposes.
          </p>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-8 md:p-10 backdrop-blur-xl border border-navy-secondary/30 shadow-2xl"
        >
          <form onSubmit={submit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Your Name
              </label>
              <input 
                type="text"
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full bg-navy-tertiary/50 border border-navy-secondary/50 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-neon-purple/50 focus:ring-2 focus:ring-accent-neon-purple/20 transition-all duration-200"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Email Address
              </label>
              <input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="john@example.com"
                className="w-full bg-navy-tertiary/50 border border-navy-secondary/50 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-neon-cyan/50 focus:ring-2 focus:ring-accent-neon-cyan/20 transition-all duration-200"
              />
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Your Message
              </label>
              <textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Tell us what you're thinking..."
                rows={6}
                className="w-full bg-navy-tertiary/50 border border-navy-secondary/50 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-neon-purple/50 focus:ring-2 focus:ring-accent-neon-purple/20 transition-all duration-200 resize-none"
              />
            </div>

            {/* Submit Button */}
            <motion.button 
              type="submit"
              className="w-full button-primary justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Send Message</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>
          </form>
        </motion.div>

        {/* Contact Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        >
          {/* Email Card */}
          <div className="glass-card p-6 text-center hover:border-accent-neon-purple/30 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-neon-purple/20 to-accent-neon-cyan/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-2">Email</h3>
            <p className="text-sm text-text-muted">arjun@intellidoc.ai</p>
          </div>

          {/* Location Card */}
          <div className="glass-card p-6 text-center hover:border-accent-neon-cyan/30 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-neon-cyan/20 to-accent-neon-purple/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-2">Location</h3>
            <p className="text-sm text-text-muted">San Francisco, CA</p>
          </div>

          {/* Support Card */}
          <div className="glass-card p-6 text-center hover:border-accent-neon-purple/30 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-neon-purple/20 to-accent-neon-cyan/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-2">Support</h3>
            <p className="text-sm text-text-muted">24/7 Available</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPersonal;
