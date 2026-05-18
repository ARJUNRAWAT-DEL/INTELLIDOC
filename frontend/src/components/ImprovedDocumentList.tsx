import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  MoreVertical,
  Search,
  RefreshCw,
  Trash2,
} from "lucide-react";

interface Document {
  id: number;
  title: string;
  created_at?: string;
  file_size?: number;
}

interface ImprovedDocumentListProps {
  documents: Document[];
  selectedId: number | null;
  onSelectDocument: (id: number) => void;
  onDeleteDocument: (id: number) => void;
  onRefresh: () => void;
  filter: string;
  setFilter: (filter: string) => void;
  isLoading?: boolean;
}

const ImprovedDocumentList: React.FC<ImprovedDocumentListProps> = ({
  documents,
  selectedId,
  onSelectDocument,
  onDeleteDocument,
  onRefresh,
  filter,
  setFilter,
  isLoading = false,
}) => {
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const filteredDocs = documents.filter((d) =>
    (d.title || "").toLowerCase().includes(filter.toLowerCase())
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffHours < 1) return "just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] border border-[#1e1e1e] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1e1e1e] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#888]">Documents</span>
          {filteredDocs.length > 0 && (
            <span className="text-[10px] text-[#3a3a3a] tabular-nums">
              {filteredDocs.length}
            </span>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`p-1 rounded text-[#3a3a3a] hover:text-[#666] hover:bg-[#1a1a1a] transition-colors ${
            isLoading ? "opacity-40" : ""
          }`}
          title="Refresh"
        >
          <motion.div
            animate={{ rotate: isLoading ? 360 : 0 }}
            transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
          >
            <RefreshCw size={12} />
          </motion.div>
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-[#1e1e1e] flex-shrink-0">
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#333]"
            size={11}
          />
          <input
            type="text"
            placeholder="Search…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 rounded bg-[#191919] border border-[#252525] text-[#bbb] placeholder-[#333] text-xs focus:outline-none focus:border-[#2e2e2e] transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-1">
        <AnimatePresence mode="popLayout">
          {filteredDocs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-32 text-center"
            >
              <p className="text-xs text-[#444]">No documents yet</p>
              <p className="text-[10px] text-[#333] mt-0.5">
                Upload a file to get started
              </p>
            </motion.div>
          ) : (
            filteredDocs.map((doc) => {
              const isSelected = selectedId === doc.id;
              const size = formatFileSize(doc.file_size);
              const date = formatDate(doc.created_at);

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => onSelectDocument(doc.id)}
                  className={`group relative px-3 py-2.5 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#1c1c1c]"
                      : "hover:bg-[#161616]"
                  }`}
                >
                  {/* Active indicator */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600 rounded-r" />
                  )}

                  <div className="flex items-start gap-2.5">
                    <FileText
                      size={13}
                      className={`flex-shrink-0 mt-0.5 ${
                        isSelected ? "text-[#888]" : "text-[#444]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium truncate ${
                          isSelected ? "text-[#e0e0e0]" : "text-[#aaa]"
                        }`}
                      >
                        {doc.title || `Document ${doc.id}`}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {date && (
                          <span className="text-[10px] text-[#444]">{date}</span>
                        )}
                        {size && date && (
                          <span className="text-[10px] text-[#333]">·</span>
                        )}
                        {size && (
                          <span className="text-[10px] text-[#3a3a3a]">
                            {size}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3-dot menu */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === doc.id ? null : doc.id);
                        }}
                        className="p-1 rounded text-[#333] hover:text-[#666] hover:bg-[#1e1e1e] opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <MoreVertical size={12} />
                      </button>

                      <AnimatePresence>
                        {menuOpenId === doc.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: -4 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-0 top-6 z-30 w-28 rounded bg-[#1c1c1c] border border-[#2a2a2a] shadow-xl py-0.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setMenuOpenId(null);
                                onDeleteDocument(doc.id);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#888] hover:text-red-400 hover:bg-[#222] transition-colors"
                            >
                              <Trash2 size={11} />
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ImprovedDocumentList;
