import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Copy,
  Download,
  Settings2,
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface ChatAIWorkspaceProps {
  messages: Message[];
  query: string;
  setQuery: (q: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  metrics?: any;
  dualInfo?: any;
  selectedDoc: any;
  onCopy: (text: string) => void;
  onDownloadPDF: () => void;
  onDownloadDOCX: () => void;
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
  answerLength: string;
  setAnswerLength: (val: string) => void;
  answerMode: string;
  setAnswerMode: (val: string) => void;
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4)
          return <strong key={i} className="font-semibold text-[#d8d8d8]">{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
          return <em key={i} className="italic text-[#aaa]">{part.slice(1, -1)}</em>;
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trimEnd();

    if (!line.trim()) { i++; continue; }

    // Headings
    const hm = line.match(/^(#{1,3})\s+(.*)/);
    if (hm) {
      result.push(
        <p key={i} className={`font-semibold text-[#d0d0d0] mt-3 mb-0.5 ${hm[1].length === 1 ? "text-sm" : "text-xs uppercase tracking-wider"}`}>
          {renderInline(hm[2])}
        </p>
      );
      i++; continue;
    }

    // Unordered list
    if (/^[\-\*•]\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[\-\*•]\s/.test(lines[i]?.trimEnd() ?? "")) {
        items.push(
          <li key={i} className="flex gap-2 leading-relaxed">
            <span className="text-[#3a3a3a] mt-[3px] flex-shrink-0">·</span>
            <span className="text-[#b0b0b0]">{renderInline(lines[i].replace(/^[\-\*•]\s/, ""))}</span>
          </li>
        );
        i++;
      }
      result.push(<ul key={`ul-${i}`} className="my-2 space-y-1.5 ml-1">{items}</ul>);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = [];
      let n = 1;
      while (i < lines.length && /^\d+\.\s/.test(lines[i]?.trimEnd() ?? "")) {
        items.push(
          <li key={i} className="flex gap-2.5 leading-relaxed">
            <span className="text-[#555] flex-shrink-0 tabular-nums text-xs mt-[3px]">{n}.</span>
            <span className="text-[#b0b0b0]">{renderInline(lines[i].replace(/^\d+\.\s/, ""))}</span>
          </li>
        );
        i++; n++;
      }
      result.push(<ol key={`ol-${i}`} className="my-2 space-y-1.5 ml-1">{items}</ol>);
      continue;
    }

    // HR
    if (/^[-=]{3,}$/.test(line.trim())) {
      result.push(<hr key={i} className="border-t border-[#1e1e1e] my-3" />);
      i++; continue;
    }

    result.push(
      <p key={i} className="text-[#aaa] leading-relaxed text-sm">{renderInline(line)}</p>
    );
    i++;
  }

  return <div className="space-y-1">{result}</div>;
}

// ─── Typing dots ──────────────────────────────────────────────────────────────

const TypingDots = () => (
  <div className="flex items-center gap-1 py-2 px-1">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        animate={{ opacity: [0.2, 0.7, 0.2], y: [0, -2, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.2 }}
        className="w-1 h-1 rounded-full bg-[#555] block"
      />
    ))}
  </div>
);

// ─── Metrics panel ────────────────────────────────────────────────────────────

interface MetricsPanelProps {
  metrics: any;
  dualInfo: any;
  onCopy: () => void;
  onDownloadPDF: () => void;
  onDownloadDOCX: () => void;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({
  metrics,
  dualInfo,
  onCopy,
  onDownloadPDF,
  onDownloadDOCX,
}) => {
  const [showRejected, setShowRejected] = React.useState(false);
  const [showCitations, setShowCitations] = React.useState(false);

  const selectedSource: string = dualInfo?.selected_source ?? metrics?.selected_source ?? "";
  const rejectedSource = selectedSource === "groq" ? "local" : selectedSource === "local" ? "groq" : "";
  const rejectedAnswer: string =
    selectedSource === "groq" ? dualInfo?.local_answer : dualInfo?.groq_answer;

  const citations: any[] = metrics?.citations ?? [];
  const sources: any[] = metrics?.sources ?? [];

  return (
    <div className="mt-4 rounded-lg border border-[#1e1e1e] bg-[#0e0e0e] overflow-hidden text-xs">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#1e1e1e] flex items-center gap-3">
        <span className="font-medium text-[#888] uppercase tracking-wider text-[10px]">
          Answer Metrics
        </span>
        <div className="flex items-center gap-1.5 ml-auto">
          {metrics?.responseTimeMs && (
            <span className="flex items-center gap-1 text-[#444]">
              <Clock size={10} />
              {metrics.responseTimeMs} ms
            </span>
          )}
          {metrics?.accuracy != null && (
            <span className="flex items-center gap-1 text-[#444] ml-2">
              <Zap size={10} />
              {typeof metrics.accuracy === "number"
                ? metrics.accuracy.toFixed(2)
                : metrics.accuracy}
            </span>
          )}
        </div>
      </div>

      {/* Core grid */}
      <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2.5">
        {selectedSource && (
          <div>
            <p className="text-[10px] text-[#3a3a3a] uppercase tracking-wider mb-0.5">
              Selected model
            </p>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={11} className="text-green-600" />
              <span className="text-[#888] font-medium capitalize">{selectedSource}</span>
            </div>
          </div>
        )}
        {metrics?.selection_reason && (
          <div>
            <p className="text-[10px] text-[#3a3a3a] uppercase tracking-wider mb-0.5">
              Selection reason
            </p>
            <p className="text-[#666] leading-relaxed">{metrics.selection_reason}</p>
          </div>
        )}
        {metrics?.accuracy != null && (
          <div>
            <p className="text-[10px] text-[#3a3a3a] uppercase tracking-wider mb-0.5">
              Confidence
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-[#1e1e1e] rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${Math.min(100, (metrics.accuracy) * 100)}%` }}
                />
              </div>
              <span className="text-[#666] tabular-nums">
                {typeof metrics.accuracy === "number"
                  ? (metrics.accuracy * 100).toFixed(0)
                  : metrics.accuracy}%
              </span>
            </div>
          </div>
        )}
        {metrics?.responseTimeMs && (
          <div>
            <p className="text-[10px] text-[#3a3a3a] uppercase tracking-wider mb-0.5">
              Response time
            </p>
            <span className="text-[#666]">{metrics.responseTimeMs} ms</span>
          </div>
        )}
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <div className="px-4 py-2.5 border-t border-[#1a1a1a]">
          <p className="text-[10px] text-[#3a3a3a] uppercase tracking-wider mb-1.5">
            Sources
          </p>
          <div className="space-y-1">
            {sources.slice(0, 4).map((src: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5">
                <FileText size={10} className="text-[#3a3a3a] flex-shrink-0" />
                <span className="text-[#555] truncate">
                  {src.doc_title || src.doc_id || `Source ${i + 1}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Citations */}
      {citations.length > 0 && (
        <div className="border-t border-[#1a1a1a]">
          <button
            onClick={() => setShowCitations(!showCitations)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-[#444] hover:text-[#777] hover:bg-[#141414] transition-colors"
          >
            <span className="text-[10px] uppercase tracking-wider">
              Citations ({citations.length})
            </span>
            {showCitations ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          {showCitations && (
            <div className="px-4 pb-3 space-y-2">
              {citations.map((c: any, i: number) => (
                <div key={i} className="bg-[#141414] border border-[#1e1e1e] rounded p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#555] text-[10px] flex items-center gap-1">
                      <FileText size={9} />
                      {c.doc_title || `Source ${i + 1}`}
                    </span>
                    {c.confidence != null && (
                      <span className="text-[10px] text-[#444] tabular-nums">
                        conf {typeof c.confidence === "number" ? c.confidence.toFixed(2) : c.confidence}
                      </span>
                    )}
                  </div>
                  {c.text && (
                    <p className="text-[#555] leading-relaxed line-clamp-3">"{c.text}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rejected answer */}
      {rejectedAnswer && rejectedSource && (
        <div className="border-t border-[#1a1a1a]">
          <button
            onClick={() => setShowRejected(!showRejected)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-[#444] hover:text-[#777] hover:bg-[#141414] transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={11} className="text-[#555]" />
              <span className="text-[10px] uppercase tracking-wider">
                Rejected answer — {rejectedSource}
              </span>
            </div>
            {showRejected ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          {showRejected && (
            <div className="px-4 pb-3">
              <div className="bg-[#141414] border border-[#1e1e1e] rounded p-3 text-[#555] leading-relaxed">
                {renderMarkdown(rejectedAnswer)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export buttons */}
      <div className="px-4 py-3 border-t border-[#1a1a1a] flex gap-2">
        <button
          onClick={onCopy}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#191919] border border-[#252525] text-[#888] hover:text-[#ccc] hover:border-[#333] hover:bg-[#1c1c1c] transition-colors"
        >
          <Copy size={11} />
          <span>Copy</span>
        </button>
        <button
          onClick={onDownloadPDF}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#191919] border border-[#252525] text-[#888] hover:text-[#ccc] hover:border-[#333] hover:bg-[#1c1c1c] transition-colors"
        >
          <Download size={11} />
          <span>PDF</span>
        </button>
        <button
          onClick={onDownloadDOCX}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#191919] border border-[#252525] text-[#888] hover:text-[#ccc] hover:border-[#333] hover:bg-[#1c1c1c] transition-colors"
        >
          <Download size={11} />
          <span>DOCX</span>
        </button>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const ChatAIWorkspace: React.FC<ChatAIWorkspaceProps> = ({
  messages,
  query,
  setQuery,
  onSendMessage,
  isLoading,
  metrics,
  dualInfo,
  selectedDoc,
  onCopy,
  onDownloadPDF,
  onDownloadDOCX,
  showAdvanced,
  setShowAdvanced,
  answerLength,
  setAnswerLength,
  answerMode,
  setAnswerMode,
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, metrics]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const lastAiMsg = [...messages].reverse().find((m) => m.type === "ai");
  const hasMetrics = metrics && (metrics.responseTimeMs || metrics.accuracy != null);

  const modeLabel: Record<string, string> = {
    summary: "Summary",
    qa: "Q&A",
    keypoints: "Key Points",
    actionitems: "Action Items",
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] border border-[#1e1e1e] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#1e1e1e] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#e0e0e0]">Ask IntelliDoc</span>
          {selectedDoc && (
            <span className="text-xs text-[#444]">— {selectedDoc.title || "document"}</span>
          )}
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`p-1.5 rounded transition-colors text-xs flex items-center gap-1.5 ${
            showAdvanced
              ? "text-[#ccc] bg-[#1c1c1c]"
              : "text-[#444] hover:text-[#777] hover:bg-[#191919]"
          }`}
          title="Options"
        >
          <Settings2 size={13} />
          {showAdvanced && (
            <span className="text-[10px]">
              {answerLength} · {modeLabel[answerMode] ?? answerMode}
            </span>
          )}
        </button>
      </div>

      {/* Advanced options */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            key="adv"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="border-b border-[#1e1e1e] overflow-hidden flex-shrink-0"
          >
            <div className="px-5 py-3 grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[#444] uppercase tracking-wider font-medium mb-1.5 block">
                  Length
                </label>
                <select
                  value={answerLength}
                  onChange={(e) => setAnswerLength(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#191919] border border-[#252525] text-[#bbb] text-xs focus:outline-none focus:border-[#333] cursor-pointer"
                >
                  <option value="short">Short</option>
                  <option value="balanced">Balanced</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#444] uppercase tracking-wider font-medium mb-1.5 block">
                  Mode
                </label>
                <select
                  value={answerMode}
                  onChange={(e) => setAnswerMode(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#191919] border border-[#252525] text-[#bbb] text-xs focus:outline-none focus:border-[#333] cursor-pointer"
                >
                  <option value="summary">Summary</option>
                  <option value="qa">Q&amp;A</option>
                  <option value="keypoints">Key Points</option>
                  <option value="actionitems">Action Items</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 && !isLoading ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-16"
            >
              <p className="text-sm text-[#444] mb-1">
                {selectedDoc
                  ? `Ask anything about "${selectedDoc.title || "this document"}"`
                  : "Select a document, then ask a question"}
              </p>
              <p className="text-xs text-[#2e2e2e]">
                Responses are grounded in your document content
              </p>
            </motion.div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.type === "ai" && (
                  <div className="w-5 h-5 rounded bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold text-[#555] select-none">
                    AI
                  </div>
                )}

                <div
                  className={`flex flex-col gap-2 ${
                    msg.type === "user"
                      ? "items-end max-w-md"
                      : "items-start flex-1 min-w-0"
                  }`}
                >
                  {msg.type === "user" ? (
                    <div className="px-3.5 py-2.5 rounded-lg bg-[#1c1c1c] border border-[#252525] text-sm text-[#d8d8d8] leading-relaxed">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed w-full">
                      {renderMarkdown(msg.content)}
                    </div>
                  )}

                  {/* Citations pill row */}
                  {msg.type === "ai" && msg.sources && msg.sources.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className="text-[10px] text-[#333]">Sources:</span>
                      {msg.sources.slice(0, 5).map((src, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#191919] border border-[#222] text-[10px] text-[#555]"
                        >
                          <FileText size={8} />
                          {src || `Source ${i + 1}`}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Metrics panel — appears after the last AI message */}
                  {msg.type === "ai" && msg.id === lastAiMsg?.id && hasMetrics && (
                    <div className="w-full">
                      <MetricsPanel
                        metrics={metrics}
                        dualInfo={dualInfo}
                        onCopy={() => onCopy(msg.content)}
                        onDownloadPDF={onDownloadPDF}
                        onDownloadDOCX={onDownloadDOCX}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-5 h-5 rounded bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold text-[#555] select-none">
              AI
            </div>
            <TypingDots />
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-[#1e1e1e] flex-shrink-0">
        <div className="flex gap-2.5 items-end">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedDoc ? "Ask a question…" : "Select a document first…"}
            rows={2}
            disabled={!selectedDoc || isLoading}
            className="flex-1 px-3.5 py-2.5 rounded bg-[#191919] border border-[#252525] text-[#d0d0d0] placeholder-[#333] text-sm focus:outline-none focus:border-[#2e2e2e] transition-colors resize-none disabled:opacity-30 disabled:cursor-not-allowed leading-relaxed"
          />
          <button
            onClick={onSendMessage}
            disabled={isLoading || !query.trim() || !selectedDoc}
            className="h-10 w-10 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-[#252525] mt-1.5 text-right">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatAIWorkspace;
