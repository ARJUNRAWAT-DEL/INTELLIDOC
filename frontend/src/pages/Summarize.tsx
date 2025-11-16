import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Spinner } from '../components/Spinner';
import { FiTrash2, FiCopy, FiChevronDown, FiChevronUp } from 'react-icons/fi';
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
  const [previewExpanded, setPreviewExpanded] = useState(false);

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
    <div className="py-12 px-2 sm:px-6 min-h-screen animate-fadein">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-2">
          <h2 className="text-4xl font-extrabold tracking-tight text-text-primary">Summarize & Ask — <span className="text-gradient">Upload your document</span></h2>
          <div className="text-sm text-text-muted">{files.length} documents • {selectedDoc ? `Selected: ${selectedDoc.title}` : 'No document selected'}</div>
        </div>

  <div className="flex flex-col gap-6">
          {/* Section 1: Upload */}
          <div className="glass-card backdrop-blur-xl border border-navy-secondary/30 rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-accent-neon-purple/30 animate-section">
            <h3 className="font-semibold mb-3 text-text-primary text-lg">Upload a document</h3>
            <p className="text-sm text-text-muted mb-4">Supported: PDF, DOCX, TXT. Uploads are processed in the background.</p>

            <div ref={dragRef} className={`border-2 transition-all duration-200 ${dragActive ? 'border-accent-neon-purple bg-accent-neon-purple/10 scale-105' : 'border-dashed border-navy-secondary/50 bg-navy-tertiary/30'} rounded-lg p-6 flex flex-col items-center justify-center gap-3`}> 
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v10" stroke="#9A4DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 7l4-4 4 4" stroke="#9A4DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="13" width="18" height="8" rx="2" stroke="#4F9CFF" strokeWidth="1.2"/></svg>
              <div className="text-sm text-text-secondary">Drag & drop a file here, or</div>
              <label className="inline-flex items-center px-4 py-2 button-primary cursor-pointer hover:scale-105 transition-transform">
                <input type="file" onChange={onFileChange} className="hidden" />
                <span className="text-sm font-medium">Choose file</span>
              </label>
              <div className="text-xs text-text-muted">Allowed: .pdf, .docx, .doc, .txt • Max {Math.round((1024*1024*25)/1024/1024)} MB</div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-navy-tertiary/50 rounded-full h-3 overflow-hidden">
                <div className="h-3 bg-gradient-to-r from-accent-neon-purple to-accent-neon-cyan transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2 text-sm">
                <div className="text-text-secondary flex items-center gap-2">
                  {uploading && <Spinner className="inline-block mr-1" />}
                  {uploading || uploadTaskId ? (
                    uploadProgress === 100 && !uploading
                      ? <span className="text-accent-neon-cyan font-semibold">Document uploaded!</span>
                      : `${uploadProgress}% ${uploading ? 'uploading...' : 'processing...'}`
                  ) : 'No active upload'}
                </div>
                {uploadTaskId && <div className="text-xs text-text-muted">Task: {uploadTaskId.slice(0,8)}</div>}
              </div>
            </div>
          </div>

          {/* Section 2: Documents list */}
          <div className="glass-card backdrop-blur-xl border border-navy-secondary/30 rounded-2xl p-6 shadow-2xl flex flex-col transition-all duration-300 hover:border-accent-neon-cyan/30 animate-section" style={{ animationDelay: '0.08s' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-text-primary text-lg">Your documents</h3>
              <div className="text-xs text-text-muted">Showing {filteredFiles.length} of {files.length}</div>
            </div>

            <div className="mb-3">
              <input placeholder="Search documents" value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full bg-navy-tertiary/50 border border-navy-secondary/50 rounded-xl px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-neon-purple/30 focus:border-accent-neon-purple/50 transition" />
            </div>

            <div className="flex-1 overflow-y-scroll space-y-3" style={{ maxHeight: '340px', minHeight: '180px' }}>
              {filteredFiles.length === 0 && <div className="text-sm text-text-muted">No documents yet.</div>}
              {filteredFiles.map((d: any) => (
                <div key={d.id} className={`w-full p-0`}> 
                  <div className={`w-full text-left p-3 rounded-xl border flex flex-col transition-all duration-200 cursor-pointer ${selectedId === d.id ? 'border-accent-neon-purple bg-accent-neon-purple/10 shadow-lg shadow-accent-neon-purple/20 scale-[1.01]' : 'border-navy-secondary/30 hover:bg-navy-tertiary/30 hover:border-accent-neon-cyan/30 hover:scale-[1.01]'}`}>
                    <div className="flex items-center justify-between">
                      <button onClick={() => selectDocument(d.id)} className="text-left flex-1 group">
                        <div className="font-medium text-sm text-text-primary group-hover:text-accent-neon-purple transition-colors">{d.title || `Document ${d.id}`}</div>
                        <div className="text-xs text-text-muted mt-1">{d.created_at ? new Date(d.created_at).toLocaleString() : ''}</div>
                      </button>
                      <div className="flex items-center gap-2 ml-3">
                        <button title="Delete" onClick={() => deleteDocument(d.id)} className="text-xs px-2 py-1 border border-red-500/50 rounded text-red-400 hover:bg-red-500/10 hover:border-red-500 transition flex items-center gap-1"><FiTrash2 className="inline" /> Delete</button>
                      </div>
                    </div>
                    <div className="text-xs text-text-muted mt-2">{d.file_type || ''}</div>
                  </div>
                </div>
              ))}
            </div>

            {selectedDoc && (
              <div className="mt-4 p-3 bg-navy-tertiary/30 border border-navy-secondary/50 rounded-xl relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm text-text-primary">Preview</div>
                  <button onClick={() => setPreviewExpanded((v) => !v)} className="text-xs flex items-center gap-1 px-2 py-1 border border-navy-secondary/50 rounded text-text-secondary hover:bg-accent-neon-purple/10 hover:border-accent-neon-purple/50 transition">
                    {previewExpanded ? <><FiChevronUp />Collapse</> : <><FiChevronDown />Expand</>}
                  </button>
                </div>
                <div className={`text-xs text-text-secondary overflow-auto whitespace-pre-wrap transition-all duration-300 ${previewExpanded ? 'max-h-96' : 'max-h-28'}`}>{(selectedDoc && selectedDoc.content) ? (previewExpanded ? selectedDoc.content : selectedDoc.content.slice(0, 900) + (selectedDoc.content.length > 900 ? '…' : '')) : 'No preview available'}</div>
              </div>
            )}
          </div>

          {/* Section 3: QA */}
          <div className="glass-card backdrop-blur-xl border border-navy-secondary/30 rounded-2xl p-6 shadow-2xl flex flex-col transition-all duration-300 hover:border-accent-neon-purple/30 animate-section" style={{ animationDelay: '0.16s' }}>
            <h3 className="font-semibold mb-3 text-text-primary text-lg">Ask the AI</h3>
            <div className="mb-3 text-sm text-text-muted">Selected document: <span className="font-medium text-text-primary">{selectedDoc ? (selectedDoc.title || `Doc ${selectedDoc.id}`) : 'None'}</span></div>
            <textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={4} className="w-full bg-navy-tertiary/50 border border-navy-secondary/50 rounded-xl p-3 mb-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-neon-purple/30 focus:border-accent-neon-purple/50 transition" placeholder="Ask a question or request a summary for the selected document" />
            <div className="flex gap-2 mb-3 flex-wrap">
              <button onClick={runQuery} disabled={loadingAnswer} className="px-4 py-2 button-primary hover:scale-105 transition-transform flex items-center gap-2 min-w-[90px]">{loadingAnswer ? <Spinner className="inline-block" /> : null}{loadingAnswer ? 'Thinking…' : 'Ask'}</button>
              <button onClick={() => { setQuery('Summarize the document'); setAnswer(''); }} className="px-4 py-2 border border-navy-secondary/50 rounded-lg text-text-secondary hover:bg-navy-tertiary/30 hover:border-accent-neon-cyan/50 transition flex items-center gap-2"><span>Reset</span></button>
              <button onClick={() => { navigator.clipboard?.writeText(answer || ''); }} className="px-3 py-2 border border-navy-secondary/50 rounded-lg text-sm text-text-secondary hover:bg-navy-tertiary/30 hover:border-accent-neon-cyan/50 transition flex items-center gap-2"><FiCopy /> Copy</button>
            </div>

            <div className="mt-2 flex-1">
              <div className="font-medium mb-2 text-text-primary">Answer</div>
              {dualInfo ? (
                <div className="space-y-3">
                  <div className="p-3 border border-navy-secondary/50 rounded-xl bg-navy-tertiary/30 animate-fadein">
                    <div className="text-xs text-text-muted mb-1">Local model answer</div>
                    <div className="text-sm text-text-primary whitespace-pre-wrap">{dualInfo.local_answer || '—'}</div>
                  </div>

                  <div className="p-3 border border-navy-secondary/50 rounded-xl bg-navy-tertiary/30 animate-fadein">
                    <div className="text-xs text-text-muted mb-1">GROQ model answer</div>
                    <div className="text-sm text-text-primary whitespace-pre-wrap">{dualInfo.groq_answer || '—'}</div>
                  </div>

                  <div className="p-3 border border-accent-neon-purple/30 rounded-xl bg-accent-neon-purple/10 animate-fadein">
                    <div className="text-xs text-text-muted mb-1">Judge / Selection</div>
                    <div className="text-sm text-text-primary">Selected: <span className="font-medium text-accent-neon-purple">{dualInfo.selected_source}</span></div>
                    <div className="text-xs text-text-secondary mt-1">Reason: {dualInfo.selection_reason || 'N/A'}</div>
                  </div>
                </div>
              ) : (
                <div className="min-h-[160px] p-4 border border-navy-secondary/50 rounded-xl bg-navy-tertiary/30 text-sm overflow-auto whitespace-pre-wrap animate-fadein text-text-primary">{loadingAnswer ? <Spinner className="inline-block" /> : (answer || <span className="text-text-muted">No answer yet</span>)}</div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Animations */}
      <style>{`
        .animate-fadein { animation: fadein 0.7s; }
        @keyframes fadein { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-section {
          animation: sectionFadeIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes sectionFadeIn {
          0% { opacity: 0; transform: scale(0.97) translateY(30px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SummarizePage;
