import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ApiService } from '../services/api';

interface StunningUploadProps {
  onUploadStart?: (taskId: string) => void;
  onUploadComplete?: (result: any) => void;
  onUploadError?: (error: string) => void;
  uploadTaskId?: string | null;
}

const StunningUpload: React.FC<StunningUploadProps> = ({
  onUploadStart,
  onUploadComplete,
  onUploadError,
  uploadTaskId,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Reset uploading state when upload task completes
  useEffect(() => {
    if (!uploadTaskId && isUploading) {
      console.log("Upload task completed, resetting uploading state");
      setIsUploading(false);
    }
  }, [uploadTaskId, isUploading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    if (isUploading) {
      console.log("Upload already in progress, ignoring click");
      return; // Prevent double uploads
    }

    console.log("Starting upload for:", file.name);
    setIsUploading(true);

    try {
      const response = await ApiService.uploadFile(file);
      console.log("Upload initiated, task ID:", response.task_id);
      onUploadStart?.(response.task_id);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Don't reset isUploading here - let the useEffect handle it when upload completes
    } catch (err: any) {
      console.error("Upload error:", err);
      onUploadError?.(err.message);
      setIsUploading(false);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const droppedFile = files[0];
      const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
      const fileExtension = '.' + droppedFile.name.split('.').pop()?.toLowerCase();
      
      if (allowedTypes.includes(fileExtension)) {
        setFile(droppedFile);
      } else {
        alert('Please upload a PDF, DOCX, DOC, or TXT file.');
      }
    }
  }, []);

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'docx':
      case 'doc':
        return '📝';
      case 'txt':
        return '📋';
      default:
        return '📄';
    }
  };

  const getFileColor = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'from-red-500 to-pink-400';
      case 'docx':
      case 'doc':
        return 'from-blue-500 to-cyan-400';
      case 'txt':
        return 'from-gray-500 to-slate-400';
      default:
        return 'from-purple-500 to-indigo-400';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-400 rounded-3xl mb-6 shadow-2xl">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-3">
          Transform Your Documents
        </h3>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Upload any document and unlock its potential with AI-powered search and analysis
        </p>
      </div>

      {/* Upload Area */}
      <div className="relative group">
        {/* Animated Border */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-green-500 to-amber-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        
        {/* Drop Zone */}
        <div
          className={`relative border-3 border-dashed rounded-3xl p-12 text-center transition-all duration-500 cursor-pointer overflow-hidden ${
            isDragging
              ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 scale-105'
              : file
              ? 'border-green-300 bg-gradient-to-br from-green-50/80 to-emerald-50/60'
              : 'border-gray-300 bg-gradient-to-br from-white/80 to-gray-50/60 hover:border-emerald-300 hover:bg-gradient-to-br hover:from-emerald-50/80 hover:to-green-50/60'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileChange}
            className="hidden"
            style={{ display: 'none' }}
          />

          {/* Floating Elements Animation */}
          <div className="absolute top-4 left-8 w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce"></div>
          <div className="absolute top-8 right-12 w-3 h-3 bg-green-400/40 rounded-full animate-bounce animation-delay-200"></div>
          <div className="absolute bottom-6 left-16 w-1.5 h-1.5 bg-amber-400/50 rounded-full animate-bounce animation-delay-700"></div>
          <div className="absolute bottom-12 right-8 w-2.5 h-2.5 bg-orange-400/30 rounded-full animate-bounce animation-delay-1000"></div>

          <div className="pointer-events-none relative z-10">
            {!file ? (
              <>
                {/* Upload Icon */}
                <div className={`w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center transition-all duration-500 ${
                  isDragging 
                    ? 'bg-emerald-100 scale-110 shadow-2xl' 
                    : 'bg-white/80 group-hover:bg-emerald-50 group-hover:scale-110 shadow-xl'
                }`}>
                  <svg className={`w-12 h-12 transition-all duration-500 ${
                    isDragging ? 'text-emerald-500 scale-110' : 'text-gray-400 group-hover:text-emerald-500'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>

                <h4 className={`text-2xl font-bold mb-4 transition-colors ${
                  isDragging ? 'text-emerald-700' : 'text-gray-800'
                }`}>
                  {isDragging ? 'Drop your file here!' : 'Upload Your Document'}
                </h4>

                <p className={`text-lg mb-6 transition-colors ${
                  isDragging ? 'text-emerald-600' : 'text-gray-600'
                }`}>
                  {isDragging ? 'Release to upload' : 'Drag & drop or click to browse'}
                </p>

                {/* Supported Formats */}
                <div className="flex items-center justify-center space-x-6">
                  {[
                    { ext: 'PDF', color: 'bg-red-500', icon: '📄' },
                    { ext: 'DOCX', color: 'bg-blue-500', icon: '📝' },
                    { ext: 'DOC', color: 'bg-blue-600', icon: '📄' },
                    { ext: 'TXT', color: 'bg-gray-500', icon: '📋' }
                  ].map((format, index) => (
                    <div key={format.ext} 
                         className={`flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                           isDragging ? 'animate-pulse' : ''
                         }`}
                         style={{animationDelay: `${index * 100}ms`}}>
                      <span className="text-lg">{format.icon}</span>
                      <span className="text-sm font-semibold text-gray-700">{format.ext}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* File Preview */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-white/60 shadow-2xl max-w-md mx-auto">
                  <div className="flex items-start space-x-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${getFileColor(file.name)} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <span className="text-2xl">{getFileIcon(file.name)}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-gray-900 mb-2 text-lg break-words">{file.name}</h4>
                      <div className="space-y-1">
                        <p className="text-gray-600">
                          <span className="font-semibold">Size:</span> {formatFileSize(file.size)}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-semibold">Type:</span> {file.type || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-green-700 font-semibold mb-2">✨ Ready to process!</p>
                  <p className="text-gray-600 text-sm">Your document will be analyzed and made searchable</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Upload Button */}
      {file && (
        <div className="text-center">
          <button
            onClick={handleUpload}
            disabled={isUploading || !file}
            className={`group relative inline-flex items-center justify-center px-12 py-6 rounded-3xl font-bold text-lg transition-all duration-500 shadow-2xl ${
              isUploading || !file
                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                : 'bg-gradient-to-r from-emerald-600 via-green-500 to-amber-500 hover:from-emerald-700 hover:via-green-600 hover:to-amber-600 hover:shadow-3xl hover:scale-105 text-white cursor-pointer'
            }`}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-4 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Magic...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                🚀 Launch AI Processing
              </>
            )}
            
            {!isUploading && (
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
            )}
          </button>
          
          <p className="text-gray-500 text-sm mt-4">
            Your document will be processed with AI and made instantly searchable
          </p>
        </div>
      )}
    </div>
  );
};

export default StunningUpload;