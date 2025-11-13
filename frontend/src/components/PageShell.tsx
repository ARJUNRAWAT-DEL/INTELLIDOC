import React from 'react';
import { useLocation } from 'react-router-dom';

const PageShell: React.FC<{children: React.ReactNode}> = ({children}) => {
  const location = useLocation();
  const path = location.pathname || '';
  
  // Disable the entrance animation for specific pages
  const disableAnimationFor = ['/how-it-works'];
  const disableAnim = disableAnimationFor.some(p => path === p || path.startsWith(p + '/'));

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 relative overflow-hidden">
      {/* Premium decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-left gradient blob */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-600/30 to-indigo-600/20 rounded-full blur-3xl animate-blob"></div>
        
        {/* Top-right gradient blob */}
        <div className="absolute -top-20 -right-40 w-96 h-96 bg-gradient-to-bl from-purple-600/20 to-pink-600/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        
        {/* Bottom-left gradient blob */}
        <div className="absolute -bottom-40 -left-20 w-72 h-72 bg-gradient-to-tr from-cyan-600/20 to-blue-600/15 rounded-full blur-3xl animate-blob animation-delay-1000"></div>
        
        {/* Grid overlay for sophistication */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/5 to-slate-950/10"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12 z-10">
        {/* Content wrapper */}
        <div className={`${disableAnim ? '' : 'enter-slide-up'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageShell;
