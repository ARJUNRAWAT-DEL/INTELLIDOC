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
    <div className="relative min-h-screen overflow-hidden">
      {/* No decorative blobs here - handled by ProfessionalBackground */}
      <div className="relative z-10">
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
