import React, { useEffect, useState, useRef, useMemo } from "react";
import { Spinner } from "../components/Spinner";
import {
  FiTrash2,
  FiCopy,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";
import { ApiService, API_URL } from "../services/api";

interface SearchOptions {
  query: string;
  answerLength: "short" | "balanced" | "detailed";
  answerMode:
    | "summary"
    | "qa"
    | "keypoints"
    | "pageexplanation"
    | "actionitems";
  pageRange: "entire" | "specific" | "range";
  specificPage?: number;
  startPage?: number;
  endPage?: number;
}

const SummarizePage: React.FC = () => {
  const [files, setFiles] = useState<Array<any>>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [dualInfo, setDualInfo] = useState<any | null>(null);
  const [searchResponse, setSearchResponse] = useState<any>(null);
  const [metrics, setMetrics] = useState<any | null>(null);

  // Enhanced search options
  const [answerLength, setAnswerLength] = useState<
    "short" | "balanced" | "detailed"
  >("balanced");
  const [answerMode, setAnswerMode] = useState<
    "summary" | "qa" | "keypoints" | "pageexplanation" | "actionitems"
  >("summary");
  const [pageRange, setPageRange] = useState<"entire" | "specific" | "range">(
    "entire",
  );
  const [specificPage, setSpecificPage] = useState<number>(1);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(10);
  const [showAdvanced, setShowAdvanced] = useState(true);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [uploadTaskId, setUploadTaskId] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadSuccessTimeout, setUploadSuccessTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<number | null>(null);
  const dragRef = useRef<HTMLDivElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [filter, setFilter] = useState("");
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
      const f =
        e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) handleFile(f as File);
    };

    el.addEventListener("dragover", onDragOver);
    el.addEventListener("dragleave", onDragLeave);
    el.addEventListener("drop", onDrop);

    return () => {
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("dragleave", onDragLeave);
      el.removeEventListener("drop", onDrop);
    };
  }, [dragRef.current]);

  const loadDocuments = async () => {
    try {
      const docs = await ApiService.getDocuments(0, 200);
      setFiles(docs || []);
    } catch (e) {
      console.warn("Failed to load documents", e);
      setFiles([]);
    }
  };

  const selectDocument = async (id: number) => {
    setSelectedId(id);
    try {
      const doc = await ApiService.getDocument(id);
      setSelectedDoc(doc);
    } catch (e) {
      console.warn("Failed to load document", e);
      setSelectedDoc(null);
    }
  };

  const deleteDocument = async (id: number) => {
    const ok = window.confirm("Delete this document? This cannot be undone.");
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
      console.warn("Failed to delete document", e);
      alert("Delete failed — see console");
    }
  };

  const uploadWithProgress = (file: File) => {
    return new Promise<string>(async (resolve, reject) => {
      try {
        const url = `${API_URL}/upload`;
        const xhr = new XMLHttpRequest();
        const fd = new FormData();
        fd.append("file", file);

        xhr.open("POST", url, true);

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

    // Require login for uploads: if no token or user, open login modal
    const token = ApiService.getToken();
    const userRaw = localStorage.getItem("intellidoc_user");
    if (!token && !userRaw) {
      try {
        window.dispatchEvent(new Event("openLogin"));
      } catch (e) {
        /* ignore */
      }
      alert(
        "Please sign in to upload documents. A login dialog has been opened.",
      );
      return;
    }

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
          if (typeof status.progress === "number")
            setUploadProgress(Math.min(100, Math.round(status.progress)));

          if (
            status.status === "done" ||
            status.status === "completed" ||
            status.status === "finished"
          ) {
            if (pollingRef.current) {
              window.clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            setUploading(false);
            setUploadProgress(100);
            // Show success message
            const docTitle = status.result?.title || file.name || "Document";
            setUploadSuccess(`✓ ${docTitle} uploaded successfully!`);
            if (uploadSuccessTimeout) clearTimeout(uploadSuccessTimeout);
            const timeoutId = setTimeout(() => {
              setUploadSuccess(null);
            }, 4000);
            setUploadSuccessTimeout(timeoutId);
            // refresh document list
            await loadDocuments();
            // if backend returned created doc id, select it
            if (status.result && status.result.document_id) {
              selectDocument(status.result.document_id);
            }
          }
        } catch (e) {
          console.warn("Polling upload status failed", e);
        }
      }, 1000);
    } catch (e) {
      console.error("Upload failed", e);
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleFile(f);
  };

  const filteredFiles = useMemo(() => {
    if (!filter) return files;
    return files.filter((d: any) =>
      (d.title || "").toLowerCase().includes(filter.toLowerCase()),
    );
  }, [files, filter]);

  const runQuery = async () => {
    if (!query || query.trim() === "") {
      alert("Please enter a question first!");
      return;
    }
    if (!selectedDoc) {
      alert("Please select a document first!");
      return;
    }

    setLoadingAnswer(true);
    setAnswer("");
    setDualInfo(null);
    setSearchResponse(null);

    const startTime = typeof performance !== "undefined" ? performance.now() : Date.now();
    try {
      const searchOptions: SearchOptions = {
        query,
        answerLength,
        answerMode,
        pageRange,
        specificPage: pageRange === "specific" ? specificPage : undefined,
        startPage: pageRange === "range" ? startPage : undefined,
        endPage: pageRange === "range" ? endPage : undefined,
      };

      // Use enhanced search if available, fallback to regular search
      let res;
      try {
        res = await ApiService.searchEnhanced(
          searchOptions,
          selectedId || undefined,
        );
      } catch (e) {
        // Fallback to regular search
        res = await ApiService.search(query, 5, 0, selectedId || undefined);
      }

      const endTime = typeof performance !== "undefined" ? performance.now() : Date.now();
      const responseTimeMs = Math.round(endTime - startTime);

      setSearchResponse(res);

      // Build metrics: response time, accuracy estimate, collection details, selection info
      const metricObj: any = { responseTimeMs };

      // accuracy: prefer explicit field, otherwise derive from citation confidences
      if (typeof res.accuracy === "number") {
        metricObj.accuracy = res.accuracy;
      } else if (Array.isArray(res.citations) && res.citations.length) {
        const confs = res.citations
          .map((c: any) => (typeof c.confidence === "number" ? c.confidence : null))
          .filter((v: any) => v !== null) as number[];
        if (confs.length) {
          const avg = confs.reduce((a, b) => a + b, 0) / confs.length;
          metricObj.accuracy = Math.round(avg * 100) / 100;
        }
      }

      // data collection details
      metricObj.sources = res.sources || [];
      metricObj.citations = res.citations || [];

      if (res.dual_answers) {
        setDualInfo(res.dual_answers);
        metricObj.selected_source = res.dual_answers.selected_source;
        metricObj.selection_reason = res.dual_answers.selection_reason;
        const chosen =
          res.dual_answers.selected_source === "groq"
            ? res.dual_answers.groq_answer
            : res.dual_answers.local_answer;
        setAnswer(chosen || res.answer || "No answer returned");
      } else {
        setAnswer(res.answer || "No answer returned");
      }

      setMetrics(metricObj);
    } catch (e) {
      console.warn("Search failed", e);
      setAnswer(
        "Search failed. Please make sure your backend is running and try again.",
      );
    } finally {
      setLoadingAnswer(false);
    }
  };

  // Download functions
  const downloadAsPDF = async () => {
    if (!searchResponse || !answer) {
      alert("No answer to download. Please generate an answer first.");
      return;
    }

    try {
      const content = generateDocumentContent("pdf");
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("PDF download failed. Please try again.");
    }
  };

  const downloadAsDOCX = async () => {
    if (!searchResponse || !answer) {
      alert("No answer to download. Please generate an answer first.");
      return;
    }

    try {
      const content = generateDocumentContent("plain");
      const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 ${content.replace(/\n/g, "\\par ")}}`;

      const blob = new Blob([rtfContent], { type: "application/rtf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `intellidoc-answer-${new Date().toISOString().split("T")[0]}.rtf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("DOCX download failed:", error);
      alert("DOCX download failed. Please try again.");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Answer copied to clipboard!");
    } catch (error) {
      console.error("Copy failed:", error);
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Answer copied to clipboard!");
    }
  };

  const generateDocumentContent = (format: "pdf" | "plain" = "pdf") => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    if (format === "plain") {
      return `INTELLIDOC AI ANSWER REPORT
Generated: ${date} ${time}

QUESTION:
${query}

ANSWER:
${answer}

DOCUMENT:
${selectedDoc?.title || "Unknown"}

SETTINGS:
Answer Mode: ${answerMode}
Answer Length: ${answerLength}
Page Range: ${pageRange === "entire" ? "All" : pageRange === "specific" ? `Page ${specificPage}` : `${startPage}-${endPage}`}

Generated by IntelliDoc AI Document Intelligence Platform`;
    }

    const html = [] as string[];
    html.push(
      "<html><head><title>IntelliDoc Answer - " +
        date +
        "</title><style>body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }.header { border-bottom: 2px solid #333; margin-bottom: 30px; padding-bottom: 20px; }.question { background: #f5f5f5; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0; }.answer { margin: 20px 0; }.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666; }</style></head><body>",
    );
    html.push(
      '<div class="header"><h1>IntelliDoc AI Answer Report</h1><p><strong>Generated:</strong> ' +
        date +
        " " +
        time +
        "</p></div>",
    );
    html.push(
      '<div class="question"><h2>Question</h2><p>' +
        (query || "") +
        "</p></div>",
    );
    html.push(
      '<div class="answer"><h2>AI Answer</h2><p>' +
        (answer ? answer.replace(/\n/g, "<br>") : "") +
        "</p></div>",
    );
    html.push(
      "<div><h2>Document</h2><p>" +
        (selectedDoc?.title || "Unknown") +
        "</p></div>",
    );
    const pageRangeText =
      pageRange === "entire"
        ? "All"
        : pageRange === "specific"
          ? "Page " + specificPage
          : startPage + "-" + endPage;
    html.push(
      "<div><h2>Settings</h2><p>Answer Mode: " +
        answerMode +
        "<br>Answer Length: " +
        answerLength +
        "<br>Page Range: " +
        pageRangeText +
        "</p></div>",
    );
    if (metrics) {
      html.push(
        '<div><h2>Answer Metrics</h2><p>' +
          `Response time: ${metrics.responseTimeMs} ms` +
          (metrics.accuracy ? `<br>Accuracy: ${metrics.accuracy}` : "") +
          (metrics.selected_source ? `<br>Selected: ${metrics.selected_source}` : "") +
          (metrics.selection_reason ? `<br>Reason: ${metrics.selection_reason}` : "") +
          "</p></div>",
      );
    }
    html.push(
      '<div class="footer"><p>Generated by IntelliDoc AI Document Intelligence Platform</p></div></body></html>',
    );
    return html.join("");
  };

  return (
    <div className="min-h-screen relative solar-bg">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="planet sun"></div>
        <div className="planet mercury"></div>
        <div className="planet venus"></div>
        <div className="planet earth"></div>
        <div className="planet mars"></div>
        <div className="planet jupiter"></div>
        <div className="planet saturn"></div>
        <div className="planet neptune"></div>
        <div className="orbit small"></div>
        <div className="orbit medium"></div>
        <div className="orbit large"></div>
      </div>
      <div className="relative z-20 py-12 px-4 sm:px-8 min-h-screen animate-fadein">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
            <h2 className="text-4xl font-extrabold tracking-tight text-white">
              IntelliDoc AI - Upload & Ask Questions
            </h2>
            <div className="text-sm text-gray-300">
              {files.length} documents •{" "}
              {selectedDoc
                ? `Selected: ${selectedDoc.title}`
                : "No document selected"}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="col-span-5 flex flex-col gap-6">
              <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-xl">
                <h3 className="font-semibold mb-3">Upload a document</h3>
                {uploadSuccess && (
                  <div className="mb-3 p-3 bg-green-100 border border-green-300 rounded-lg text-sm text-green-800 flex items-center gap-2">
                    <span>{uploadSuccess}</span>
                  </div>
                )}
                <div
                  ref={dragRef}
                  className={`border-2 transition-all duration-200 ${dragActive ? "border-purple-400 bg-purple-50" : "border-dashed border-gray-200 bg-white"} rounded-lg p-6 flex flex-col items-center justify-center gap-3`}
                >
                  <div className="text-sm text-gray-700">
                    Drag & drop a file here, or
                  </div>
                  <label className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded shadow cursor-pointer hover:scale-105 transition-transform">
                    <input
                      type="file"
                      onChange={onFileChange}
                      className="hidden"
                    />
                    <span className="text-sm font-medium">Choose file</span>
                  </label>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-xl flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Your documents</h3>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-400">
                      Showing {filteredFiles.length} of {files.length}
                    </div>
                    <button
                      onClick={loadDocuments}
                      title="Refresh documents"
                      className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-600 hover:text-gray-900"
                    >
                      <FiRefreshCw size={18} />
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <input
                    placeholder="Search documents"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div
                  className="flex-1 overflow-y-auto space-y-3"
                  style={{ maxHeight: "340px" }}
                >
                  {filteredFiles.length === 0 && (
                    <div className="text-sm text-gray-500">
                      No documents yet.
                    </div>
                  )}
                  {filteredFiles.map((d: any) => (
                    <div key={d.id} className={`w-full p-0`}>
                      <div
                        onClick={() => selectDocument(d.id)}
                        className={`w-full text-left p-3 rounded-md border flex items-center justify-between cursor-pointer ${selectedId === d.id ? "border-purple-500 bg-purple-50" : "hover:bg-gray-50"}`}
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {d.title || `Document ${d.id}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {d.created_at
                              ? new Date(d.created_at).toLocaleString()
                              : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(d.id);
                            }}
                            className="text-xs px-2 py-1 border rounded text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-7 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Ask IntelliDoc
                </h3>
                <div className="text-sm text-gray-600">
                  Selected:{" "}
                  {selectedDoc
                    ? selectedDoc.title || `Doc ${selectedDoc.id}`
                    : "None"}
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="mb-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showAdvanced ? (
                  <FiChevronUp size={16} />
                ) : (
                  <FiChevronDown size={16} />
                )}
                {showAdvanced ? "Hide" : "Show"} Answer Options
              </button>

              {/* Advanced Options */}
              {showAdvanced && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Answer Length
                      </label>
                      <select
                        value={answerLength}
                        onChange={(e) =>
                          setAnswerLength(
                            e.target.value as "short" | "balanced" | "detailed",
                          )
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                      >
                        <option value="short">Short</option>
                        <option value="balanced">Balanced</option>
                        <option value="detailed">Detailed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Answer Mode
                      </label>
                      <select
                        value={answerMode}
                        onChange={(e) =>
                          setAnswerMode(
                            e.target.value as
                              | "summary"
                              | "qa"
                              | "keypoints"
                              | "pageexplanation"
                              | "actionitems",
                          )
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                      >
                        <option value="summary">Summary</option>
                        <option value="qa">Q&A</option>
                        <option value="keypoints">Key Points</option>
                        <option value="pageexplanation">
                          Page Explanation
                        </option>
                        <option value="actionitems">Action Items</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Page Range
                    </label>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="radio"
                          value="entire"
                          checked={pageRange === "entire"}
                          onChange={(e) => setPageRange(e.target.value as any)}
                        />
                        All
                      </label>
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="radio"
                          value="specific"
                          checked={pageRange === "specific"}
                          onChange={(e) => setPageRange(e.target.value as any)}
                        />
                        Specific
                      </label>
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="radio"
                          value="range"
                          checked={pageRange === "range"}
                          onChange={(e) => setPageRange(e.target.value as any)}
                        />
                        Range
                      </label>
                    </div>
                    {pageRange === "specific" && (
                      <input
                        type="number"
                        min="1"
                        value={specificPage}
                        onChange={(e) =>
                          setSpecificPage(Math.max(1, parseInt(e.target.value)))
                        }
                        placeholder="Page #"
                        className="w-full border rounded px-2 py-1 text-sm mt-2"
                      />
                    )}
                    {pageRange === "range" && (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="number"
                          min="1"
                          value={startPage}
                          onChange={(e) =>
                            setStartPage(Math.max(1, parseInt(e.target.value)))
                          }
                          placeholder="Start"
                          className="w-1/2 border rounded px-2 py-1 text-sm"
                        />
                        <input
                          type="number"
                          min="1"
                          value={endPage}
                          onChange={(e) =>
                            setEndPage(Math.max(1, parseInt(e.target.value)))
                          }
                          placeholder="End"
                          className="w-1/2 border rounded px-2 py-1 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={4}
                className="w-full border rounded-lg p-3 mb-3 text-sm"
                placeholder="Ask a question about your document..."
              />

              <div className="flex gap-2 mb-3">
                <button
                  onClick={runQuery}
                  disabled={loadingAnswer}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg"
                >
                  {loadingAnswer ? "Generating..." : "Generate Answer"}
                </button>
                <button
                  onClick={() => {
                    setQuery("");
                    setAnswer("");
                    setSearchResponse(null);
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Reset
                </button>
              </div>

              <div className="mt-2 flex-1">
                <div className="font-medium mb-2">AI Answer</div>
                <div className="min-h-[320px] p-6 border rounded bg-gray-50 text-sm overflow-auto whitespace-pre-wrap">
                  {loadingAnswer ? (
                    <Spinner />
                  ) : (
                    answer || (
                      <span className="text-gray-400">No answer yet.</span>
                    )
                  )}
                </div>
              </div>

              {metrics && (
                <div className="mt-4 p-4 bg-white border rounded-lg text-sm">
                  <div className="font-semibold mb-2">Answer Metrics</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                    <div>
                      <strong>Response time:</strong> {metrics.responseTimeMs} ms
                    </div>
                    <div>
                      {metrics.accuracy != null && (
                        <><strong>Accuracy:</strong> {metrics.accuracy}</>
                      )}
                    </div>
                    <div>
                      <strong>Selected answer:</strong> {metrics.selected_source || "n/a"}
                    </div>
                    <div>
                      <strong>Selection reason:</strong> {metrics.selection_reason || "n/a"}
                    </div>
                  </div>

                  {metrics.sources && metrics.sources.length > 0 && (
                    <div className="mt-3 text-xs">
                      <div className="font-medium">Sources:</div>
                      <ul className="list-disc list-inside">
                        {metrics.sources.map((s: any, idx: number) => (
                          <li key={idx}>{s.doc_title || s.doc_id}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {metrics.citations && metrics.citations.length > 0 && (
                    <div className="mt-3 text-xs">
                      <div className="font-medium">Citations (sample):</div>
                      <ul className="list-disc list-inside">
                        {metrics.citations.slice(0, 5).map((c: any, idx: number) => (
                          <li key={idx}>
                            {(c.doc_title || c.doc_id) + (c.quote ? `: "${String(c.quote).slice(0,120)}"` : "")}
                            {c.confidence ? ` (conf ${c.confidence})` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Export Buttons */}
              {answer && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => copyToClipboard(answer)}
                    title="Copy to clipboard"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <FiCopy size={16} />
                    Copy
                  </button>
                  <button
                    onClick={downloadAsPDF}
                    title="Download as PDF"
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <FiDownload size={16} />
                    PDF
                  </button>
                  <button
                    onClick={downloadAsDOCX}
                    title="Download as DOCX"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <FiDownload size={16} />
                    DOCX
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarizePage;
