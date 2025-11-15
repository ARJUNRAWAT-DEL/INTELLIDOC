import React from 'react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gradient-to-b from-navy-primary via-navy-secondary to-navy-primary/80">
      {/* Decorative blobs - Midnight Neon style */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-accent-neon-cyan/10 to-accent-neon-purple/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between text-sm relative z-10">
        <motion.div 
          className="text-text-muted"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          © {new Date().getFullYear()} IntelliDoc. All rights reserved.
        </motion.div>
        <motion.div 
          className="mt-4 md:mt-0 text-text-muted"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Built with React, TypeScript & Tailwind CSS
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
