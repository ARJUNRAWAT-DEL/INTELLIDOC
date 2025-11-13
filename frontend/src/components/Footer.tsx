import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-sm">
        <div className="text-slate-400">© {new Date().getFullYear()} IntelliDoc. All rights reserved.</div>
        <div className="mt-2 md:mt-0 text-slate-400">Built with React, TypeScript & Tailwind CSS</div>
      </div>
    </footer>
  );
};

export default Footer;
