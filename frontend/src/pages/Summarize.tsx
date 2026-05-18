import React, { useEffect, useState, useRef, useMemo } from "react";
import { Spinner } from "../components/Spinner";
import { ApiService, API_URL } from "../services/api";
import TopNav from "../components/TopNav";
import Sidebar from "../components/Sidebar";
import ImprovedUpload from "../components/ImprovedUpload";
import ImprovedDocumentList from "../components/ImprovedDocumentList";
import ChatAIWorkspace from "../components/ChatAIWorkspace";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface ConversationEntry {
  id: string;
  title: string;
  messages: ChatMessage[];
  selectedDocId: number | null;
}

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
  // Navigation & Layout
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [activeSection, setActiveSection] = useState("chat");

  // Conversation history
  const [conversations, setConversations] = useState<ConversationEntry[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string>(
    () => `conv-${Date.now()}`
  );

  // Document management
  const [files, setFiles] = useState<Array<any>>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [filter, setFilter] = useState("");

  // Chat & Query
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState("");
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
    "entire"
  );
  const [specificPage, setSpecificPage] = useState<number>(1);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(10);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  // Auto-save current conversation whenever messages change
  useEffect(() => {
    if (messages.length === 0) return;
    const firstUser = messages.find((m) => m.type === "user");
    if (!firstUser) return;
    const raw = firstUser.content;
    const title = raw.length > 42 ? raw.slice(0, 40) + "…" : raw;
    setConversations((prev) => {
      const entry: ConversationEntry = {
        id: currentConvId,
        title,
        messages: [...messages],
        selectedDocId: selectedId,
      };
      const filtered = prev.filter((c) => c.id !== currentConvId);
      return [entry, ...filtered].slice(0, 20);
    });
  }, [messages, currentConvId, selectedId]);

  const handleNewChat = () => {
    setCurrentConvId(`conv-${Date.now()}`);
    setMessages([]);
    setQuery("");
    setSelectedId(null);
    setSelectedDoc(null);
    setMetrics(null);
    setDualInfo(null);
    setSearchResponse(null);
  };

  const handleSelectConversation = (id: string) => {
    if (id === currentConvId) return;
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;
    setCurrentConvId(conv.id);
    setMessages(conv.messages);
    setQuery("");
    setMetrics(null);
    if (conv.selectedDocId !== null) {
      selectDocument(conv.selectedDocId);
    } else {
      setSelectedId(null);
      setSelectedDoc(null);
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

    // Add user message to chat
    const userMsgId = Date.now().toString();
    const userMessage: ChatMessage = {
      id: userMsgId,
      type: "user",
      content: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuery(""); // Clear input
    setLoadingAnswer(true);
    setDualInfo(null);
    setSearchResponse(null);

    const startTime = typeof performance !== "undefined" ? performance.now() : Date.now();
    try {
      const searchOptions: SearchOptions = {
        query: userMessage.content,
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
        res = await ApiService.search(userMessage.content, 5, 0, selectedId || undefined);
      }

      const endTime = typeof performance !== "undefined" ? performance.now() : Date.now();
      const responseTimeMs = Math.round(endTime - startTime);

      setSearchResponse(res);

      // Build metrics
      const metricObj: any = { responseTimeMs };

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

      metricObj.sources = res.sources || [];
      metricObj.citations = res.citations || [];

      let answer = "";
      if (res.dual_answers) {
        setDualInfo(res.dual_answers);
        metricObj.selected_source = res.dual_answers.selected_source;
        metricObj.selection_reason = res.dual_answers.selection_reason;
        const chosen =
          res.dual_answers.selected_source === "groq"
            ? res.dual_answers.groq_answer
            : res.dual_answers.local_answer;
        answer = chosen || res.answer || "No answer returned";
      } else {
        answer = res.answer || "No answer returned";
      }

      setMetrics(metricObj);

      // Add AI response to chat
      const aiMsgId = (Date.now() + 1).toString();
      const aiMessage: ChatMessage = {
        id: aiMsgId,
        type: "ai",
        content: answer,
        timestamp: new Date(),
        sources: res.sources?.map((s: any) => s.doc_title || s.doc_id),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (e) {
      console.warn("Search failed", e);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "Search failed. Please make sure your backend is running and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoadingAnswer(false);
    }
  };

  // Download functions
  const downloadAsPDF = async () => {
    if (messages.length === 0) {
      alert("No answer to download. Please generate an answer first.");
      return;
    }

    try {
      // Find the last AI message
      const lastAIMsg = [...messages].reverse().find((m) => m.type === "ai");
      if (!lastAIMsg) {
        alert("No AI response found.");
        return;
      }

      const content = generateDocumentContent("pdf", lastAIMsg.content);
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
    if (messages.length === 0) {
      alert("No answer to download. Please generate an answer first.");
      return;
    }

    try {
      const lastAIMsg = [...messages].reverse().find((m) => m.type === "ai");
      if (!lastAIMsg) {
        alert("No AI response found.");
        return;
      }

      const content = generateDocumentContent("plain", lastAIMsg.content);
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

  const generateDocumentContent = (format: "pdf" | "plain" = "pdf", answerText: string = "") => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    // Find the last user query
    const lastUserMsg = [...messages]
      .reverse()
      .find((m) => m.type === "user");
    const queryText = lastUserMsg?.content || query || "Unknown query";

    if (format === "plain") {
      return `INTELLIDOC AI ANSWER REPORT
Generated: ${date} ${time}

QUESTION:
${queryText}

ANSWER:
${answerText}

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
        (queryText || "") +
        "</p></div>",
    );
    html.push(
      '<div class="answer"><h2>AI Answer</h2><p>' +
        (answerText ? answerText.replace(/\n/g, "<br>") : "") +
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
    <div className="h-screen flex flex-col overflow-hidden bg-[#111111]">
      <TopNav isDark={isDark} setIsDark={setIsDark} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          conversations={conversations}
          currentConvId={currentConvId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        {/* Workspace */}
        <div className="flex-1 flex overflow-hidden p-3 gap-3">
          {/* Left panel: Upload + Documents */}
          <div className="w-60 flex-shrink-0 flex flex-col gap-3">
            <ImprovedUpload
              dragActive={dragActive}
              setDragActive={setDragActive}
              uploading={uploading}
              uploadProgress={uploadProgress}
              onFileSelect={handleFile}
              dragRef={dragRef}
            />
            <div className="flex-1 overflow-hidden">
              <ImprovedDocumentList
                documents={files}
                selectedId={selectedId}
                onSelectDocument={selectDocument}
                onDeleteDocument={deleteDocument}
                onRefresh={loadDocuments}
                filter={filter}
                setFilter={setFilter}
                isLoading={uploading}
              />
            </div>
          </div>

          {/* Chat workspace */}
          <div className="flex-1 overflow-hidden">
            <ChatAIWorkspace
              messages={messages}
              query={query}
              setQuery={setQuery}
              onSendMessage={runQuery}
              isLoading={loadingAnswer}
              metrics={metrics}
              dualInfo={dualInfo}
              selectedDoc={selectedDoc}
              onCopy={(text) => copyToClipboard(text)}
              onDownloadPDF={downloadAsPDF}
              onDownloadDOCX={downloadAsDOCX}
              showAdvanced={showAdvanced}
              setShowAdvanced={setShowAdvanced}
              answerLength={answerLength}
              setAnswerLength={setAnswerLength}
              answerMode={answerMode}
              setAnswerMode={setAnswerMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarizePage;
