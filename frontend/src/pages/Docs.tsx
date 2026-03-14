import { useState } from 'react';

const sections = [
  { id: 'quickstart', label: 'Quickstart' },
  { id: 'auth', label: 'Authentication' },
  { id: 'upload', label: 'Upload Document' },
  { id: 'query', label: 'Query Document' },
  { id: 'list', label: 'List Documents' },
  { id: 'delete', label: 'Delete Document' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'errors', label: 'Error Codes' },
];

const codeBlocks: Record<string, { lang: string; code: string }> = {
  quickstart: {
    lang: 'python',
    code: `import intellidoc

client = intellidoc.Client(api_key="sk_live_...")

# Upload a document
doc = client.documents.upload("contract.pdf")
print(doc.id)  # doc_abc123

# Ask a question
result = client.query(doc_id=doc.id, question="What are the renewal clauses?")
print(result.answer)`,
  },
  auth: {
    lang: 'bash',
    code: `# All API requests require a Bearer token
curl https://api.intellidoc.ai/v1/documents \\ 
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json"`,
  },
  upload: {
    lang: 'bash',
    code: `curl -X POST https://api.intellidoc.ai/v1/documents/upload \\
  -H "Authorization: Bearer sk_live_..." \\
  -F "file=@contract.pdf"

# Response
{
  "id": "doc_abc123",
  "title": "contract.pdf",
  "status": "processing",
  "created_at": "2026-03-11T10:00:00Z"
}`,
  },
  query: {
    lang: 'bash',
    code: `curl -X POST https://api.intellidoc.ai/v1/query \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "doc_id": "doc_abc123",
    "question": "Summarize the key obligations"
  }'

# Response
{
  "answer": "The key obligations include...",
  "sources": [{ "page": 3, "excerpt": "..." }],
  "processing_time_ms": 87
}`,
  },
  list: {
    lang: 'bash',
    code: `curl https://api.intellidoc.ai/v1/documents \\
  -H "Authorization: Bearer sk_live_..."

# Response
{
  "documents": [
    { "id": "doc_abc123", "title": "contract.pdf", "created_at": "2026-03-11" },
    { "id": "doc_xyz789", "title": "report.docx", "created_at": "2026-03-10" }
  ],
  "total": 2
}`,
  },
  delete: {
    lang: 'bash',
    code: `curl -X DELETE https://api.intellidoc.ai/v1/documents/doc_abc123 \\
  -H "Authorization: Bearer sk_live_..."

# Response: 204 No Content`,
  },
  webhooks: {
    lang: 'json',
    code: `// Webhook payload (POST to your endpoint)
{
  "event": "document.processed",
  "doc_id": "doc_abc123",
  "status": "completed",
  "timestamp": "2026-03-11T10:01:45Z"
}

// Set webhook URL in dashboard → Settings → Webhooks`,
  },
  errors: {
    lang: 'json',
    code: `// Common error responses
{ "error": "unauthorized",   "status": 401 }  // Invalid API key
{ "error": "not_found",      "status": 404 }  // Document not found
{ "error": "quota_exceeded", "status": 429 }  // Plan limit reached
{ "error": "invalid_file",   "status": 422 }  // Unsupported format`,
  },
};

const descriptions: Record<string, string> = {
  quickstart: 'Get up and running in 2 minutes. Install the SDK, set your API key, upload a document, and start querying.',
  auth: 'Authenticate every request using your secret API key as a Bearer token. Never expose your key client-side.',
  upload: 'Upload PDF, DOCX, TXT, or PPTX files up to 50 MB. The document is processed asynchronously — use webhooks or poll for status.',
  query: 'Ask any natural language question about an uploaded document. Returns an AI-generated answer with source citations.',
  list: 'Retrieve a paginated list of all documents in your account. Supports filtering by date and status.',
  delete: 'Permanently delete a document and all associated data. This action is irreversible.',
  webhooks: 'Register a HTTPS endpoint to receive real-time events when documents finish processing.',
  errors: 'All errors follow a consistent JSON format with machine-readable codes and HTTP status codes.',
};

export default function Docs() {
  const [active, setActive] = useState('quickstart');
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(codeBlocks[active].code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34D399' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] inline-block" />
            REST API v1
          </div>
          <h1 className="text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk, Inter, system-ui', letterSpacing: '-0.02em' }}>Docs &amp; API</h1>
          <p className="text-lg" style={{ color: '#8B92B0' }}>Complete reference for the IntelliDoc REST API. Base URL: <code className="text-sm px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)', color: '#34D399' }}>https://api.intellidoc.ai/v1</code></p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden md:flex flex-col gap-1 w-52 flex-shrink-0">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#8B92B0' }}>Reference</p>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className="text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={active === s.id
                  ? { background: 'rgba(154,77,255,0.15)', color: '#B566FF', borderLeft: '3px solid #9A4DFF' }
                  : { color: '#8B92B0' }
                }
              >
                {s.label}
              </button>
            ))}

            <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
              <p className="text-xs font-semibold text-white mb-1">SDK Downloads</p>
              {['Python', 'Node.js', 'Go'].map((sdk) => (
                <div key={sdk} className="flex items-center justify-between mt-2">
                  <span className="text-xs" style={{ color: '#8B92B0' }}>{sdk}</span>
                  <span className="text-xs font-medium" style={{ color: '#34D399' }}>↓ Install</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile tab select */}
            <div className="md:hidden mb-6">
              <select
                value={active}
                onChange={(e) => setActive(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white outline-none text-sm"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {sections.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              {/* Section header */}
              <div className="px-6 py-5" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk, Inter, system-ui' }}>
                  {sections.find((s) => s.id === active)?.label}
                </h2>
                <p className="text-sm mt-1" style={{ color: '#8B92B0' }}>{descriptions[active]}</p>
              </div>

              {/* Code block */}
              <div className="relative">
                <div className="flex items-center justify-between px-6 py-3" style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: '#28CA41' }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: '#8B92B0' }}>{codeBlocks[active].lang}</span>
                    <button onClick={copy} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all" style={{ background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.07)', color: copied ? '#34D399' : '#8B92B0', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {copied ? (
                        <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> Copied!</>
                      ) : (
                        <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" /></svg> Copy</>
                      )}
                    </button>
                  </div>
                </div>
                <pre className="px-6 py-5 overflow-x-auto text-sm" style={{ background: 'rgba(0,0,0,0.4)', color: '#E2E8F0', fontFamily: 'Consolas, Monaco, monospace', lineHeight: '1.7', margin: 0 }}>
                  <code>{codeBlocks[active].code}</code>
                </pre>
              </div>
            </div>

            {/* Navigation between sections */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => { const idx = sections.findIndex((s) => s.id === active); if (idx > 0) setActive(sections[idx - 1].id); }}
                disabled={sections[0].id === active}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#D4D8E8' }}
              >
                ← Previous
              </button>
              <button
                onClick={() => { const idx = sections.findIndex((s) => s.id === active); if (idx < sections.length - 1) setActive(sections[idx + 1].id); }}
                disabled={sections[sections.length - 1].id === active}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#D4D8E8' }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
