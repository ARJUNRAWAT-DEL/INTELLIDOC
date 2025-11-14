import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const PageShell: React.FC<{children: React.ReactNode}> = ({children}) => {
  const location = useLocation();
  const path = location.pathname || '';
  
  // Disable the entrance animation for specific pages
  const disableAnimationFor = ['/how-it-works'];
  const disableAnim = disableAnimationFor.some(p => path === p || path.startsWith(p + '/'));

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 relative overflow-hidden">
      {/* Premium decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-left gradient blob */}
        <motion.div 
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent-blue/20 to-accent-purple/10 rounded-full blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        ></motion.div>
        
        {/* Top-right gradient blob */}
        <motion.div 
          className="absolute -top-20 -right-40 w-96 h-96 bg-gradient-to-bl from-accent-purple/15 to-accent-cyan/10 rounded-full blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        ></motion.div>
        
        {/* Bottom-left gradient blob */}
        <motion.div 
          className="absolute -bottom-40 -left-20 w-72 h-72 bg-gradient-to-tr from-accent-cyan/15 to-accent-blue/10 rounded-full blur-3xl"
          animate={{ y: [0, 15, 0], x: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        ></motion.div>
        
        {/* Grid overlay for sophistication */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-900/5 to-navy-800/10"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12 z-10">
        {/* Content wrapper */}
        <motion.div
          initial={disableAnim ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default PageShell;
