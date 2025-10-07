import React, { useState, useEffect } from "react";
import { ApiService } from "../services/api";

// Local type definitions to avoid import issues
interface DocumentSummary {
  id: number;
  title: string;
  summary: string | null;
  created_at: string | null;
  file_size: number | null;
  file_type: string | null;
  chunks_count: number | null;
}

interface DocumentLibraryProps {
  onDocumentSelect?: (doc: DocumentSummary) => void;
  refreshTrigger?: number;
}

const DocumentLibrary: React.FC<DocumentLibraryProps> = ({ 
  onDocumentSelect, 
  refreshTrigger 
}) => {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await ApiService.getDocuments();
      setDocuments(docs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      await ApiService.deleteDocument(id);
      setDocuments(docs => docs.filter(doc => doc.id !== id));
    } catch (err: any) {
      alert("Failed to delete document: " + err.message);
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "Unknown";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString();
  };

  useEffect(() => {
    loadDocuments();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading documents: {error}</p>
        <button 
          onClick={loadDocuments}
          className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center p-6">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500 mt-2">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Document Library ({documents.length})
        </h3>
        <button
          onClick={loadDocuments}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  📄 {doc.title}
                </h4>
                
                {doc.summary && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {doc.summary}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span>📅 {formatDate(doc.created_at)}</span>
                  <span>📏 {formatFileSize(doc.file_size)}</span>
                  {doc.file_type && <span>📋 {doc.file_type}</span>}
                  {doc.chunks_count && <span>🧩 {doc.chunks_count} chunks</span>}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                {onDocumentSelect && (
                  <button
                    onClick={() => onDocumentSelect(doc)}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200"
                  >
                    Select
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(doc.id, doc.title)}
                  className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentLibrary;