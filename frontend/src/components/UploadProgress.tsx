import React, { useState, useEffect } from "react";
import { ApiService } from "../services/api";

// Local type definitions to avoid import issues
interface TaskStatus {
  task_id: string;
  status: string; // "processing", "completed", "failed"
  progress: number; // 0-100
  message: string;
  result?: {
    document_id: number;
    title: string;
    chunks_count: number;
    file_size: number;
    file_type: string;
  };
}

interface UploadProgressProps {
  taskId: string | null;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  taskId,
  onComplete,
  onError,
}) => {
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!taskId) {
      setStatus(null);
      setPolling(false);
      return;
    }

    setPolling(true);
    const pollStatus = async () => {
      try {
        const taskStatus = await ApiService.getUploadStatus(taskId);
        setStatus(taskStatus);

        if (taskStatus.status === "completed") {
          setPolling(false);
          onComplete?.(taskStatus.result);
        } else if (taskStatus.status === "failed") {
          setPolling(false);
          onError?.(taskStatus.message);
        }
      } catch (err: any) {
        setPolling(false);
        onError?.(err.message);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 1000); // Poll every second

    return () => {
      clearInterval(interval);
      setPolling(false);
    };
  }, [taskId, onComplete, onError]);

  if (!taskId || !status) {
    return null;
  }

  const getStatusColor = () => {
    switch (status.status) {
      case "processing":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case "processing":
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        );
      case "completed":
        return (
          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case "failed":
        return (
          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getStatusColor()} flex items-center justify-center`}>
          {getStatusIcon()}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-900">
              Upload Progress
            </h4>
            <span className="text-xs text-gray-500">
              {status.progress}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getStatusColor()}`}
              style={{ width: `${status.progress}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-600 mt-2">{status.message}</p>
          
          {/* Result Details */}
          {status.status === "completed" && status.result && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <h5 className="text-sm font-medium text-green-900 mb-1">
                Upload Successful!
              </h5>
              <div className="text-xs text-green-700 space-y-1">
                <p>📄 Document: {status.result.title}</p>
                <p>🆔 ID: {status.result.document_id}</p>
                <p>🧩 Chunks: {status.result.chunks_count}</p>
                <p>📏 Size: {Math.round(status.result.file_size / 1024)} KB</p>
                <p>📋 Type: {status.result.file_type}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadProgress;