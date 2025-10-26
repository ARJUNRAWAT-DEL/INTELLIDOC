import { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import ModernSearchResults from "./components/ModernSearchResults";
import StunningUpload from "./components/StunningUpload";
import DocumentLibrary from "./components/DocumentLibrary";
import UploadProgress from "./components/UploadProgress";
import { ApiService } from "./services/api";

// Local type definitions to avoid import issues
interface Source {
  doc_id: number;
  doc_title: string;
}

interface DualAnswerInfo {
  local_answer: string;
  groq_answer: string;
  selected_source: string;
  selection_reason: string;
  dual_answers_enabled: boolean;
}

interface SearchResponse {
  query: string;
  answer: string;
  sources: Source[];
  processing_time?: number;
  dual_answers?: DualAnswerInfo;
}

interface DocumentSummary {
  id: number;
  title: string;
  summary: string | null;
  created_at: string | null;
  file_size: number | null;
  file_type: string | null;
  chunks_count: number | null;
}

interface Metrics {
  documents_count: number;
  chunks_count: number;
  avg_chunks_per_doc: number;
  total_file_size: number;
  model_info: Record<string, any>;
}

function App() {
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [uploadTaskId, setUploadTaskId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentSummary | null>(null);
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "library" | "metrics">("upload");

  // Load metrics on startup
  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const metricsData = await ApiService.getMetrics();
      setMetrics(metricsData);
    } catch (err) {
      console.error("Failed to load metrics:", err);
    }
  };

  // ---------------- Search ----------------
  const handleSearch = async (query: string) => {
    setSearchLoading(true);
    setSearchError(null);
    setSearchResponse(null);

    try {
      const response = await ApiService.search(query, 10, 0, selectedDocument?.id);
      setSearchResponse(response);
    } catch (err: any) {
      setSearchError(err.message || String(err));
    } finally {
      setSearchLoading(false);
    }
  };

  // ---------------- Upload Handlers ----------------
  const handleUploadStart = (taskId: string) => {
    setUploadTaskId(taskId);
  };

  const handleUploadComplete = (result: any) => {
    setUploadTaskId(null);
    setRefreshDocuments(prev => prev + 1);
    loadMetrics();
    alert(`Document "${result.title}" uploaded successfully!`);
  };

  const handleUploadError = (error: string) => {
    setUploadTaskId(null);
    alert("Upload failed: " + error);
  };
  return (
    <div className="min-h-screen relative bg-transparent">

      {/* Page Content */}
      <div className="relative z-20">
        {/* Top navigation (demo style: rounded dark green pill) */}
        <div className="w-full py-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-[var(--nav-green)] text-white rounded-full px-4 py-3 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-6">
                <div className="text-2xl font-extrabold tracking-tight ml-2">IntelliDoc</div>
                <nav className="hidden md:flex items-center gap-6 text-sm opacity-90">
                  <a className="hover:opacity-100" href="#">Solution</a>
                  <a className="hover:opacity-100" href="#">Resources</a>
                </nav>
              </div>
              <div className="flex items-center gap-3">
                <button className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-sm">Get a quote</button>
                <button className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-sm">Log in</button>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--cta-pink)] text-white text-sm shadow">Book a demo</button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero + Dashboard wrapper (shared white rounded backdrop for consistent look) */}
        <div className="px-8 pb-16">
          <div className="max-w-7xl mx-auto relative px-4">
            <div className="absolute -inset-6 rounded-5xl bg-white shadow-4xl pointer-events-none -z-10" />
            <div className="relative z-10">
              {/* Hero (demo look) */}
              <section className="bg-transparent">
                <div className="px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h1 className="text-6xl md:text-7xl font-extrabold text-[var(--nav-green)] leading-tight">IntelliDoc
                      <br/>Document Intelligence</h1>
                    <p className="text-2xl text-[var(--nav-green)] font-semibold">Search. Summarize. Discover.</p>
                    <p className="text-lg text-[rgba(0,0,0,0.55)] max-w-2xl mt-4">IntelliDoc turns your PDFs, Word documents and text files into a searchable knowledge base. Upload documents, index content, and ask natural-language questions — get accurate, sourced answers instantly.</p>
                    <div className="mt-8 flex items-center gap-4">
                      <button className="px-6 py-3 rounded-full bg-[var(--nav-green)] text-white font-semibold shadow">Try IntelliDoc</button>
                      <a className="text-sm text-[rgba(0,0,0,0.6)]">How it works →</a>
                    </div>
                  </div>
                  <div className="flex justify-center lg:justify-end">
                    {/* Phone mockup */}
                    <div className="w-80 h-[480px] rounded-3xl bg-white shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
                      <div className="h-12 bg-[var(--demo-pink-1)] flex items-center px-4 text-sm text-[var(--nav-green)] font-semibold">IntelliDoc</div>
                      <div className="flex-1 p-6 bg-white">
                        <div className="h-full rounded-2xl bg-[linear-gradient(180deg,#fff,#fff)] p-4">
                          <div className="text-sm text-gray-600 mb-4">We've got some questions for you. Are you ready?</div>
                          <div className="flex justify-end">
                            <div className="bg-[var(--cta-pink)] text-white px-4 py-2 rounded-full">Yes!</div>
                          </div>
                        </div>
                      </div>
                      <div className="h-10 bg-[var(--demo-pink-2)]"></div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Dashboard */}
              <section className="mt-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                  <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-3xl overflow-hidden">
                      <div className="flex bg-gradient-to-r from-gray-50/60 to-white/40 p-2">
                        {[{ key: 'upload', label: 'Upload', icon: '🚀' }, { key: 'library', label: 'Library', icon: '📚' }, { key: 'metrics', label: 'Analytics', icon: '📊' }].map(tab => (
                          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} className={`flex-1 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-3 ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-xl transform scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'}`}>
                            <span className="text-lg">{tab.icon}</span>{tab.label}
                          </button>
                        ))}
                      </div>
                      <div className="p-8">
                        {activeTab === 'upload' && <StunningUpload onUploadStart={handleUploadStart} onUploadComplete={handleUploadComplete} onUploadError={handleUploadError} uploadTaskId={uploadTaskId} />}
                        {activeTab === 'library' && <DocumentLibrary onDocumentSelect={setSelectedDocument} refreshTrigger={refreshDocuments} />}
                        {activeTab === 'metrics' && metrics && <div className="space-y-6">{/* metrics summary */}
                          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">System Analytics</h3>
                          <div className="grid grid-cols-2 gap-6">{[{ label: 'Documents', value: metrics.documents_count, icon: '📄', color: 'from-blue-500 to-cyan-400' }, { label: 'Text Chunks', value: metrics.chunks_count, icon: '🧩', color: 'from-purple-500 to-pink-400' }, { label: 'Avg/Doc', value: metrics.avg_chunks_per_doc.toFixed(1), icon: '📊', color: 'from-emerald-500 to-green-400' }, { label: 'Storage', value: `${Math.round(metrics.total_file_size / 1024 / 1024)} MB`, icon: '💾', color: 'from-amber-500 to-orange-400' }].map((metric, index) => (
                            <div key={index} className="bg-white/70 rounded-2xl p-6 border border-white/40 shadow-lg">
                              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} mb-4 shadow-lg`}><span className="text-xl">{metric.icon}</span></div>
                              <div className="text-3xl font-black text-gray-900 mb-1">{metric.value}</div>
                              <div className="text-sm text-gray-600 font-semibold">{metric.label}</div>
                            </div>
                          ))}</div>
                        </div>}
                      </div>
                    </div>
                    <UploadProgress taskId={uploadTaskId} onComplete={handleUploadComplete} onError={handleUploadError} />
                  </div>

                  <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-3xl overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-100/60 via-purple-100/40 to-pink-100/60 p-8 border-b border-white/30">
                        <div className="flex flex-col lg:flex-row items-center justify-between">
                          <div className="text-center lg:text-left mb-6 lg:mb-0">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl mb-4 shadow-2xl"><svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg></div>
                            <h2 className="text-4xl font-black text-gray-900 mb-3">Intelligent Search</h2>
                            <p className="text-lg text-gray-700">Ask anything and get instant AI-powered answers</p>
                          </div>
                          {selectedDocument && <div className="bg-white/80 rounded-2xl p-6 border border-white/60 shadow-xl"><div className="flex items-center space-x-4"><div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-400 rounded-xl flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg></div><div className="flex-1"><p className="text-sm text-gray-600 font-semibold">Focused Search:</p><p className="font-bold text-gray-900 truncate">{selectedDocument.title}</p></div><button onClick={() => setSelectedDocument(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button></div></div>}
                        </div>
                      </div>
                      <div className="p-8"><SearchBar onSearch={handleSearch} /></div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200 shadow-3xl min-h-[600px] overflow-hidden">
                      <div className="p-8 border-b border-white/20"><div className="flex items-center space-x-4"><div className="w-16 h-16 bg-gradient-to-br from-violet-600 via-purple-500 to-pink-400 rounded-2xl flex items-center justify-center shadow-xl"><svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg></div><div><h3 className="text-3xl font-black text-gray-900">AI Intelligence Hub</h3><p className="text-lg text-gray-700">Powered by advanced neural networks</p></div></div></div>
                      <div className="p-8"><ModernSearchResults searchResponse={searchResponse} loading={searchLoading} error={searchError} /></div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <footer className="px-8 py-12 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-xl">
              <p className="text-gray-600 text-lg">Powered by cutting-edge AI technology • Built for the future of document intelligence</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;