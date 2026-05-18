import React from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";

interface ImprovedUploadProps {
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  uploading: boolean;
  uploadProgress: number;
  onFileSelect: (file: File) => void;
  dragRef: React.RefObject<HTMLDivElement>;
}

const ImprovedUpload: React.FC<ImprovedUploadProps> = ({
  dragActive,
  setDragActive,
  uploading,
  uploadProgress,
  onFileSelect,
  dragRef,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex-shrink-0">
      <div
        ref={dragRef}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        className={`border border-dashed rounded-lg px-4 py-5 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
          dragActive
            ? "border-[#333] bg-[#191919]"
            : "border-[#1e1e1e] hover:border-[#2a2a2a] hover:bg-[#161616]"
        }`}
      >
        <Upload
          size={16}
          className={dragActive ? "text-[#666]" : "text-[#333]"}
        />
        <div className="text-center">
          <p className="text-xs text-[#666]">
            {dragActive ? "Drop to upload" : "Upload document"}
          </p>
          <p className="text-[10px] text-[#333] mt-0.5">
            PDF, DOCX, TXT · 20 MB max
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
          className="hidden"
        />
      </div>

      {uploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#555]">Indexing…</span>
            <span className="text-[10px] text-[#555] tabular-nums">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full h-0.5 rounded-full bg-[#1e1e1e] overflow-hidden">
            <motion.div
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ImprovedUpload;
