import { useNavigate } from 'react-router-dom';

const solutions = [
  {
    icon: '⚖️',
    name: 'Legal Teams',
    tagline: 'Review contracts 10× faster',
    color: '#4F9CFF',
    glow: 'rgba(79,156,255,0.15)',
    border: 'rgba(79,156,255,0.25)',
    desc: 'Automatically extract clauses, identify risks, summarize NDAs and contracts. Never miss a deadline or renewal clause again.',
    features: ['Contract summarization', 'Clause extraction & tagging', 'Risk flag detection', 'Comparison across versions', 'Export to Word / PDF'],
    stat: { value: '10×', label: 'faster contract review' },
  },
  {
    icon: '🏥',
    name: 'Healthcare',
    tagline: 'Understand medical records instantly',
    color: '#9A4DFF',
    glow: 'rgba(154,77,255,0.15)',
    border: 'rgba(154,77,255,0.3)',
    desc: 'Parse clinical trial papers, patient intake forms, and research literature. HIPAA-compliant processing with full audit trails.',
    features: ['Clinical document parsing', 'Research paper summarization', 'HIPAA-compliant storage', 'Structured data extraction', 'Multi-language support'],
    stat: { value: '85%', label: 'reduction in manual review' },
  },
  {
    icon: '🛠️',
    name: 'Developers',
    tagline: 'Build AI document apps with our API',
    color: '#34D399',
    glow: 'rgba(52,211,153,0.12)',
    border: 'rgba(52,211,153,0.2)',
    desc: 'Integrate IntelliDoc into your own product with our REST API. SDKs for Python, Node, and more. Full OpenAPI spec included.',
    features: ['REST API + Webhooks', 'Python & Node.js SDKs', 'OpenAPI / Swagger docs', 'Streaming responses', 'Sandbox & dev mode'],
    stat: { value: '<100ms', label: 'average API response' },
  },
  {
    icon: '🎓',
    name: 'Education',
    tagline: 'Summarize research in seconds',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.2)',
    desc: 'Students and researchers can instantly summarize papers, extract citations, and ask AI questions about any academic document.',
    features: ['Research paper Q&A', 'Citation extraction', 'Auto bibliography', 'Multi-document analysis', 'Notes export'],
    stat: { value: '2min', label: 'to summarize 200 pages' },
  },
  {
    icon: '🏦',
    name: 'Finance',
    tagline: 'Extract data from financial docs',
    color: '#EC4899',
    glow: 'rgba(236,72,153,0.12)',
    border: 'rgba(236,72,153,0.2)',
    desc: 'Process invoices, annual reports, and audit documents. Extract tables, figures, and key metrics with structured JSON output.',
    features: ['Invoice data extraction', 'Financial table parsing', 'Annual report summarization', 'JSON structured output', 'Batch processing'],
    stat: { value: '99.2%', label: 'extraction accuracy' },
  },
  {
    icon: '🏢',
    name: 'Enterprise',
    tagline: 'Custom AI for your organization',
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.2)',
    desc: 'White-label IntelliDoc or deploy on-premise. SSO, custom models, dedicated infrastructure, and enterprise SLAs.',
    features: ['On-premise deployment', 'SSO / SAML 2.0', 'Custom model fine-tuning', 'Dedicated account manager', 'Custom SLA & compliance'],
    stat: { value: '100%', label: 'data sovereignty' },
  },
];

export default function Solutions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(154,77,255,0.07) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(79,156,255,0.1)', border: '1px solid rgba(79,156,255,0.2)', color: '#4F9CFF' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F9CFF] inline-block" />
            Built for every industry
          </div>
          <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, Inter, system-ui', letterSpacing: '-0.02em' }}>Solutions for your team</h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#8B92B0' }}>Whether you're in legal, healthcare, finance, or building your own product — IntelliDoc fits your workflow.</p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {solutions.map((sol) => (
            <div
              key={sol.name}
              className="rounded-2xl p-7 flex flex-col transition-all duration-300 group cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${sol.border}` }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 40px ${sol.glow}`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
            >
              <div className="text-3xl mb-4">{sol.icon}</div>
              <div className="text-xs font-semibold mb-1" style={{ color: sol.color }}>{sol.name.toUpperCase()}</div>
              <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, Inter, system-ui' }}>{sol.tagline}</h3>
              <p className="text-sm mb-5" style={{ color: '#8B92B0' }}>{sol.desc}</p>
              <ul className="space-y-2 flex-1 mb-6">
                {sol.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs" style={{ color: '#D4D8E8' }}>
                    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" style={{ color: sol.color }}>
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="pt-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <div className="text-xl font-bold" style={{ color: sol.color, fontFamily: 'Space Grotesk, Inter, system-ui' }}>{sol.stat.value}</div>
                  <div className="text-xs" style={{ color: '#8B92B0' }}>{sol.stat.label}</div>
                </div>
                <button onClick={() => navigate('/register')} className="text-xs font-semibold px-4 py-2 rounded-lg transition-all" style={{ background: `${sol.color}18`, color: sol.color, border: `1px solid ${sol.border}` }}>
                  Get started →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div className="rounded-2xl p-10 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(154,77,255,0.15) 0%, rgba(79,156,255,0.1) 100%)', border: '1px solid rgba(154,77,255,0.25)' }}>
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #9A4DFF 0%, transparent 60%)' }} />
          <h2 className="text-3xl font-bold text-white mb-3 relative z-10" style={{ fontFamily: 'Space Grotesk, Inter, system-ui' }}>Not sure which plan fits?</h2>
          <p className="text-base mb-6 relative z-10" style={{ color: '#D4D8E8' }}>Talk to our team — we'll help you find the right solution.</p>
          <button onClick={() => navigate('/personal/contact')} className="px-8 py-3 rounded-xl font-semibold text-white relative z-10 transition-all" style={{ background: 'linear-gradient(90deg,#9A4DFF,#B566FF)', boxShadow: '0 8px 24px rgba(154,77,255,0.4)' }}>
            Talk to sales
          </button>
        </div>
      </div>
    </div>
  );
}
