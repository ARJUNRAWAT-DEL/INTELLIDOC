import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #090D1F, #0B0F20)' }}>
      {/* Top gradient divider */}
      <div className="divider-gradient w-full" />

      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(154,77,255,0.07) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
          {/* Brand */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#9A4DFF] to-[#4F9CFF] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12h6M9 16h6M9 8h6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk, Inter, system-ui' }}>IntelliDoc</span>
            </div>
            <p className="text-sm max-w-xs" style={{ color: '#8B92B0' }}>AI-powered document intelligence. Extract insights from any document in seconds.</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#8B92B0' }}>Product</p>
              <div className="flex flex-col gap-2">
                {[['/', 'Home'], ['/how-it-works', 'How it works'], ['/solutions', 'Solutions'], ['/pricing', 'Pricing']].map(([to, label]) => (
                  <Link key={to} to={to} className="text-sm transition-colors" style={{ color: '#D4D8E8' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#9A4DFF'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#D4D8E8'; }}
                  >{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#8B92B0' }}>Company</p>
              <div className="flex flex-col gap-2">
                {[['/docs', 'Docs & API'], ['/resources', 'Resources'], ['/support', 'Support'], ['/personal/contact', 'Contact']].map(([to, label]) => (
                  <Link key={to} to={to} className="text-sm transition-colors" style={{ color: '#D4D8E8' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#9A4DFF'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#D4D8E8'; }}
                  >{label}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <motion.p
            className="text-xs"
            style={{ color: '#8B92B0' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            © {new Date().getFullYear()} IntelliDoc. All rights reserved.
          </motion.p>
          <motion.p
            className="text-xs"
            style={{ color: '#8B92B0' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Built with React, TypeScript &amp; Tailwind CSS
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

