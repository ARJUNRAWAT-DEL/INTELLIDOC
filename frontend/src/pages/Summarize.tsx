import React, { useEffect, useState, useRef, useMemo } from 'react';
import { ApiService, API_URL } from '../services/api';

const SummarizePage: React.FC = () => {
  const [files, setFiles] = useState<Array<any>>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [query, setQuery] = useState('Summarize the document');
  const [answer, setAnswer] = useState<string>('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [dualInfo, setDualInfo] = useState<any | null>(null);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [uploadTaskId, setUploadTaskId] = useState<string | null>(null);
  const pollingRef = useRef<number | null>(null);
  const dragRef = useRef<HTMLDivElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadDocuments();
    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    // attach drag handlers to the drop area if present
    const el = dragRef.current;
    if (!el) return;

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      setDragActive(true);
    };
    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setDragActive(false);
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) handleFile(f as File);
    };

    el.addEventListener('dragover', onDragOver);
    el.addEventListener('dragleave', onDragLeave);
    el.addEventListener('drop', onDrop);

    return () => {
      el.removeEventListener('dragover', onDragOver);
      el.removeEventListener('dragleave', onDragLeave);
      el.removeEventListener('drop', onDrop);
    };
  }, [dragRef.current]);

  const loadDocuments = async () => {
    try {
      const docs = await ApiService.getDocuments(0, 200);
      setFiles(docs || []);
    } catch (e) {
      console.warn('Failed to load documents', e);
      setFiles([]);
    }
  };

  const selectDocument = async (id: number) => {
    setSelectedId(id);
    try {
      const doc = await ApiService.getDocument(id);
      setSelectedDoc(doc);
    } catch (e) {
      console.warn('Failed to load document', e);
      setSelectedDoc(null);
    }
  };

  const deleteDocument = async (id: number) => {
    const ok = window.confirm('Delete this document? This cannot be undone.');
    if (!ok) return;
    try {
      await ApiService.deleteDocument(id);
      // If deleted document was selected, clear selection
      if (selectedId === id) {
        setSelectedId(null);
        setSelectedDoc(null);
      }
      await loadDocuments();
    } catch (e) {
      console.warn('Failed to delete document', e);
      alert('Delete failed — see console');
    }
  };

  const uploadWithProgress = (file: File) => {
    return new Promise<string>(async (resolve, reject) => {
      try {
  const url = `${API_URL}/upload`;
        const xhr = new XMLHttpRequest();
        const fd = new FormData();
        fd.append('file', file);

        xhr.open('POST', url, true);

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            setUploadProgress(pct);
          }
        };

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const json = JSON.parse(xhr.responseText);
                resolve(json.task_id);
              } catch (err) {
                reject(err);
              }
            } else {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          }
        };

        xhr.onerror = (err) => reject(err);
        xhr.send(fd);
      } catch (e) {
        reject(e);
      }
    });
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    setUploadTaskId(null);

    try {
      const taskId = await uploadWithProgress(file);
      setUploadTaskId(taskId);

      // Poll status until done
      pollingRef.current = window.setInterval(async () => {
        try {
          const status = await ApiService.getUploadStatus(taskId);
          // if backend reports progress use that, otherwise keep uploadProgress
          if (typeof status.progress === 'number') setUploadProgress(Math.min(100, Math.round(status.progress)));

          if (status.status === 'done' || status.status === 'completed' || status.status === 'finished') {
            if (pollingRef.current) {
              window.clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            setUploading(false);
            setUploadProgress(100);
            // refresh document list
            await loadDocuments();
            // if backend returned created doc id, select it
            if (status.result && status.result.document_id) {
              selectDocument(status.result.document_id);
            }
          }
        } catch (e) {
          console.warn('Polling upload status failed', e);
        }
      }, 1000);
    } catch (e) {
      console.error('Upload failed', e);
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleFile(f);
  };

  const filteredFiles = useMemo(() => {
    if (!filter) return files;
    return files.filter((d: any) => (d.title || '').toLowerCase().includes(filter.toLowerCase()));
  }, [files, filter]);

  const runQuery = async () => {
    if (!query || query.trim() === '') return;
    setLoadingAnswer(true);
    setAnswer('');
    setDualInfo(null);
    try {
      const res = await ApiService.search(query, 5, 0, selectedId || undefined);
      // If dual answers present, store detailed info and prefer selected answer for main view
      if (res.dual_answers) {
        setDualInfo(res.dual_answers);
        // prefer selected_source answer if available
        const chosen = (res.dual_answers.selected_source === 'groq') ? res.dual_answers.groq_answer : res.dual_answers.local_answer;
        setAnswer(chosen || res.answer || 'No answer returned');
      } else {
        setAnswer(res.answer || 'No answer returned');
      }
    } catch (e) {
      console.warn('Search failed', e);
      setAnswer('Search failed — see console');
    } finally {
      setLoadingAnswer(false);
    }
  };

  return (
    <div className="py-12 px-6 bg-gradient-to-b from-pink-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-4xl font-extrabold">Summarize & Ask — Upload your document</h2>
          <div className="text-sm text-gray-600">{files.length} documents • {selectedDoc ? `Selected: ${selectedDoc.title}` : 'No document selected'}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Upload */}
          <div className="bg-white border rounded-2xl p-6 shadow-lg">
            <h3 className="font-semibold mb-3">Upload a document</h3>
            <p className="text-sm text-gray-500 mb-4">Supported: PDF, DOCX, TXT. Uploads are processed in the background.</p>

            <div ref={dragRef} className={`border-2 ${dragActive ? 'border-purple-400 bg-purple-50' : 'border-dashed border-gray-200 bg-white'} rounded-lg p-6 flex flex-col items-center justify-center gap-3`}> 
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v10" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 7l4-4 4 4" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="13" width="18" height="8" rx="2" stroke="#D6BCFA" strokeWidth="1.2"/></svg>
              <div className="text-sm text-gray-700">Drag & drop a file here, or</div>
              <label className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded cursor-pointer">
                <input type="file" onChange={onFileChange} className="hidden" />
                <span className="text-sm font-medium">Choose file</span>
              </label>
              <div className="text-xs text-gray-400">Allowed: .pdf, .docx, .doc, .txt • Max {Math.round((1024*1024*25)/1024/1024)} MB</div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2 text-sm">
                <div className="text-gray-600">{uploading || uploadTaskId ? `${uploadProgress}% ${uploading ? 'uploading...' : 'processing...'}` : 'No active upload'}</div>
                {uploadTaskId && <div className="text-xs text-gray-400">Task: {uploadTaskId.slice(0,8)}</div>}
              </div>
            </div>
          </div>

          {/* Column 2: Documents list */}
          <div className="bg-white border rounded-2xl p-6 shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Your documents</h3>
              <div className="text-xs text-gray-400">Showing {filteredFiles.length} of {files.length}</div>
            </div>

            <div className="mb-3">
              <input placeholder="Search documents" value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
            </div>

            <div className="flex-1 overflow-auto space-y-3">
              {filteredFiles.length === 0 && <div className="text-sm text-gray-500">No documents yet.</div>}
              {filteredFiles.map((d: any) => (
                <div key={d.id} className={`w-full p-0`}> 
                  <div className={`w-full text-left p-3 rounded-md border flex flex-col ${selectedId === d.id ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <button onClick={() => selectDocument(d.id)} className="text-left flex-1">
                        <div className="font-medium text-sm">{d.title || `Document ${d.id}`}</div>
                        <div className="text-xs text-gray-500 mt-1">{d.created_at ? new Date(d.created_at).toLocaleString() : ''}</div>
                      </button>
                      <div className="flex items-center gap-2 ml-3">
                        <button title="Delete" onClick={() => deleteDocument(d.id)} className="text-xs px-2 py-1 border rounded text-red-600">Delete</button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">{d.file_type || ''}</div>
                  </div>
                </div>
              ))}
            </div>

            {selectedDoc && (
              <div className="mt-4 p-3 bg-gray-50 border rounded">
                <div className="font-medium text-sm mb-2">Preview</div>
                <div className="text-xs text-gray-700 max-h-28 overflow-auto whitespace-pre-wrap">{(selectedDoc && selectedDoc.content) ? selectedDoc.content.slice(0, 900) + (selectedDoc.content.length > 900 ? '…' : '') : 'No preview available'}</div>
              </div>
            )}
          </div>

          {/* Column 3: QA */}
          <div className="bg-white border rounded-2xl p-6 shadow-lg flex flex-col">
            <h3 className="font-semibold mb-3">Ask the AI</h3>
            <div className="mb-3 text-sm text-gray-600">Selected document: <span className="font-medium">{selectedDoc ? (selectedDoc.title || `Doc ${selectedDoc.id}`) : 'None'}</span></div>
            <textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={4} className="w-full border rounded p-3 mb-3 text-sm" placeholder="Ask a question or request a summary for the selected document" />
            <div className="flex gap-2 mb-3">
              <button onClick={runQuery} disabled={loadingAnswer} className="px-4 py-2 bg-purple-600 text-white rounded shadow">{loadingAnswer ? 'Thinking…' : 'Ask'}</button>
              <button onClick={() => { setQuery('Summarize the document'); setAnswer(''); }} className="px-4 py-2 border rounded">Reset</button>
              <button onClick={() => { navigator.clipboard?.writeText(answer || ''); }} className="px-3 py-2 border rounded text-sm">Copy</button>
            </div>

            <div className="mt-2 flex-1">
              <div className="font-medium mb-2">Answer</div>
              {dualInfo ? (
                <div className="space-y-3">
                  <div className="p-3 border rounded bg-white">
                    <div className="text-xs text-gray-500 mb-1">Local model answer</div>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">{dualInfo.local_answer || '—'}</div>
                  </div>

                  <div className="p-3 border rounded bg-white">
                    <div className="text-xs text-gray-500 mb-1">GROQ model answer</div>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">{dualInfo.groq_answer || '—'}</div>
                  </div>

                  <div className="p-3 border rounded bg-gray-50">
                    <div className="text-xs text-gray-500 mb-1">Judge / Selection</div>
                    <div className="text-sm text-gray-800">Selected: <span className="font-medium">{dualInfo.selected_source}</span></div>
                    <div className="text-xs text-gray-600 mt-1">Reason: {dualInfo.selection_reason || 'N/A'}</div>
                  </div>
                </div>
              ) : (
                <div className="min-h-[160px] p-4 border rounded bg-gray-50 text-sm overflow-auto whitespace-pre-wrap">{answer || <span className="text-gray-400">No answer yet</span>}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarizePage;
