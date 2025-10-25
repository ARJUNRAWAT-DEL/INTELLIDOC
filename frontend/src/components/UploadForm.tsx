import { useState } from "react";
import { ApiService } from "../services/api";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ title: string; chunks_count?: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please choose a file first.");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const result = await ApiService.uploadFile(file);
      setUploadedFile({ title: (result as any).result?.title || file.name, chunks_count: (result as any).result?.chunks_count });
      setStatus("Upload queued — processing in background.");
    } catch (err: any) {
      console.error(err);
      setStatus(err?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">Upload Document</h3>
      <p className="text-sm text-slate-500 mb-4">Supported formats: PDF, DOCX, TXT. Files are processed asynchronously.</p>

      <div className="flex items-center gap-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="block text-sm text-slate-700 file:bg-slate-100 file:px-3 file:py-1 file:rounded-md file:border file:border-slate-200"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-slate-400' : 'bg-slate-800 hover:bg-slate-900'}`}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {status && <p className="mt-4 text-sm text-slate-600">{status}</p>}

      {uploadedFile && (
        <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md">
          <div className="font-semibold text-slate-800">{uploadedFile.title}</div>
          {uploadedFile.chunks_count !== undefined && (
            <div className="text-sm text-slate-600">Chunks: {uploadedFile.chunks_count}</div>
          )}
        </div>
      )}
    </div>
  );
}
