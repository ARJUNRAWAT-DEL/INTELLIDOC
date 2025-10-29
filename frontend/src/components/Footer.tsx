import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
        <div>© {new Date().getFullYear()} Arjun Rawat. All rights reserved.</div>
        <div className="mt-2 md:mt-0">Built with React, TypeScript & Tailwind</div>
      </div>
    </footer>
  );
};

export default Footer;
