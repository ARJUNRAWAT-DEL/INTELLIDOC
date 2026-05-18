import React from "react";
import { Search, User } from "lucide-react";

interface TopNavProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

const TopNav: React.FC<TopNavProps> = () => {
  return (
    <header className="h-12 bg-[#0e0e0e] border-b border-[#1e1e1e] flex items-center px-5 gap-4 flex-shrink-0">
      <span className="text-[#e0e0e0] font-medium text-sm tracking-tight">
        IntelliDoc
      </span>

      <div className="flex-1 max-w-xs hidden md:block">
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#3a3a3a]"
            size={12}
          />
          <input
            type="text"
            placeholder="Search documents…"
            className="w-full pl-8 pr-3 py-1.5 rounded bg-[#191919] border border-[#252525] text-[#ccc] placeholder-[#3a3a3a] text-xs focus:outline-none focus:border-[#333] transition-colors"
          />
        </div>
      </div>

      <div className="ml-auto">
        <button className="p-1.5 rounded text-[#444] hover:text-[#777] hover:bg-[#1a1a1a] transition-colors">
          <User size={15} />
        </button>
      </div>
    </header>
  );
};

export default TopNav;
