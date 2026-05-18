import React from "react";
import {
  MessageSquare,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

interface Conversation {
  id: string;
  title: string;
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  conversations: Conversation[];
  currentConvId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  activeSection: string;
  setActiveSection: (s: string) => void;
}

const bottomNav = [
  { id: "documents", label: "Documents", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  conversations,
  currentConvId,
  onSelectConversation,
  onNewChat,
  activeSection,
  setActiveSection,
}) => {
  return (
    <aside
      style={{ width: isOpen ? 220 : 48, transition: "width 0.18s ease" }}
      className="flex-shrink-0 h-full bg-[#0e0e0e] border-r border-[#1e1e1e] flex flex-col overflow-hidden"
    >
      {/* Logo */}
      <div className="h-12 flex items-center px-3 border-b border-[#1e1e1e] flex-shrink-0 gap-2.5">
        <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px] select-none">
          I
        </div>
        {isOpen && (
          <span className="text-[#e0e0e0] font-medium text-sm tracking-tight whitespace-nowrap flex-1 overflow-hidden">
            IntelliDoc
          </span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded text-[#3a3a3a] hover:text-[#777] hover:bg-[#1a1a1a] transition-colors flex-shrink-0"
        >
          {isOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
        </button>
      </div>

      {/* New Chat */}
      <div className="px-2 py-2.5 flex-shrink-0">
        <button
          onClick={onNewChat}
          title={!isOpen ? "New Chat" : undefined}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded border border-[#222] text-[#999] hover:text-[#e0e0e0] hover:bg-[#191919] hover:border-[#2a2a2a] transition-colors text-xs font-medium ${
            !isOpen ? "justify-center" : ""
          }`}
        >
          <Plus size={13} className="flex-shrink-0" />
          {isOpen && <span>New Chat</span>}
        </button>
      </div>

      {/* Conversation history */}
      <div className="flex-1 overflow-y-auto min-h-0 px-2 pb-2">
        {isOpen ? (
          <>
            {conversations.length > 0 && (
              <p className="text-[9px] text-[#333] uppercase tracking-widest font-medium px-2 pb-1 pt-0.5">
                Recent
              </p>
            )}
            {conversations.length === 0 ? (
              <div className="px-2 py-4 text-center">
                <p className="text-[10px] text-[#2e2e2e]">
                  No chats yet
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === currentConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`w-full text-left px-2 py-1.5 rounded transition-colors text-xs mb-px relative ${
                      isActive
                        ? "bg-[#1c1c1c] text-[#d0d0d0]"
                        : "text-[#555] hover:text-[#999] hover:bg-[#161616]"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 inset-y-1 w-0.5 bg-blue-600 rounded-r" />
                    )}
                    <div className="flex items-center gap-1.5 pl-1">
                      <MessageSquare
                        size={11}
                        className="flex-shrink-0 opacity-40"
                      />
                      <span className="truncate">{conv.title}</span>
                    </div>
                  </button>
                );
              })
            )}
          </>
        ) : (
          /* Collapsed: show conversation icons */
          conversations.slice(0, 8).map((conv) => {
            const isActive = conv.id === currentConvId;
            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                title={conv.title}
                className={`w-full flex items-center justify-center p-1.5 rounded mb-px transition-colors ${
                  isActive
                    ? "bg-[#1c1c1c] text-[#d0d0d0]"
                    : "text-[#3a3a3a] hover:text-[#777] hover:bg-[#161616]"
                }`}
              >
                <MessageSquare size={13} />
              </button>
            );
          })
        )}
      </div>

      {/* Bottom nav: Documents + Settings */}
      <div className="px-2 py-2.5 border-t border-[#1e1e1e] flex-shrink-0 space-y-px">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              title={!isOpen ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded transition-colors text-xs ${
                isActive
                  ? "bg-[#1c1c1c] text-[#d0d0d0]"
                  : "text-[#444] hover:text-[#888] hover:bg-[#161616]"
              } ${!isOpen ? "justify-center" : ""}`}
            >
              <Icon size={14} className="flex-shrink-0" />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
