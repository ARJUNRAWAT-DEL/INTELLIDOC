import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
  { icon: '🚀', title: 'Getting Started', desc: 'Onboarding, first upload, account setup', articles: 12 },
  { icon: '📄', title: 'Document Management', desc: 'Upload limits, formats, storage, deletion', articles: 18 },
  { icon: '🔍', title: 'AI & Search', desc: 'How queries work, improving results, accuracy', articles: 9 },
  { icon: '🔑', title: 'Account & Billing', desc: 'Plans, payments, invoices, cancellation', articles: 14 },
  { icon: '🔌', title: 'API & Integrations', desc: 'API keys, webhooks, third-party tools', articles: 21 },
  { icon: '🛡️', title: 'Security & Privacy', desc: 'Encryption, GDPR, data retention policies', articles: 7 },
];

const popular = [
  'How do I upload my first document?',
  'What file formats are supported?',
  'How accurate is the AI summarization?',
  'Can I share documents with my team?',
  'How do I get my API key?',
  'What happens to my data?',
];

export default function Support() {
  const [search, setSearch] = useState('');
  const [ticketOpen, setTicketOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(79,156,255,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        {/* Header + Search */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(79,156,255,0.1)', border: '1px solid rgba(79,156,255,0.2)', color: '#4F9CFF' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F9CFF] inline-block" />
            Help Center
          </div>
          <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, Inter, system-ui', letterSpacing: '-0.02em' }}>How can we help?</h1>
          <p className="text-lg mb-8" style={{ color: '#8B92B0' }}>Search our knowledge base or browse categories below.</p>
          <div className="relative max-w-xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#8B92B0' }} viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search help articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-2xl text-white placeholder-[#8B92B0] outline-none text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(154,77,255,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(154,77,255,0.12)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="rounded-2xl p-6 cursor-pointer transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(154,77,255,0.3)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(154,77,255,0.06)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.08)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
            >
              <div className="text-2xl mb-3">{cat.icon}</div>
              <div className="font-semibold text-white text-sm mb-1">{cat.title}</div>
              <div className="text-xs mb-3" style={{ color: '#8B92B0' }}>{cat.desc}</div>
              <div className="text-xs font-medium" style={{ color: '#9A4DFF' }}>{cat.articles} articles →</div>
            </div>
          ))}
        </div>

        {/* Popular articles */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-white mb-5" style={{ fontFamily: 'Space Grotesk, Inter, system-ui' }}>Popular articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popular
              .filter((a) => !search || a.toLowerCase().includes(search.toLowerCase()))
              .map((article) => (
                <div
                  key={article}
                  className="flex items-center gap-3 px-5 py-4 rounded-xl cursor-pointer transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(154,77,255,0.07)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
                >
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#9A4DFF' }} viewBox="0 0 24 24" fill="none">
                    <path d="M9 12h6M9 16h6M9 8h6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm" style={{ color: '#D4D8E8' }}>{article}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Contact + Ticket */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact options */}
          <div className="rounded-2xl p-7" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-lg font-bold text-white mb-5" style={{ fontFamily: 'Space Grotesk, Inter, system-ui' }}>Contact us</h3>
            <div className="space-y-4">
              {[
                { icon: '💬', title: 'Live Chat', desc: 'Available Mon–Fri, 9am–6pm IST', badge: 'Online', badgeColor: '#34D399' },
                { icon: '📧', title: 'Email Support', desc: 'support@intellidoc.ai', badge: '< 4h', badgeColor: '#4F9CFF' },
                { icon: '📞', title: 'Enterprise Hotline', desc: 'Dedicated line for Pro & Enterprise', badge: 'Pro+', badgeColor: '#9A4DFF' },
              ].map((c) => (
                <div key={c.title} className="flex items-center gap-4">
                  <span className="text-xl">{c.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{c.title}</div>
                    <div className="text-xs" style={{ color: '#8B92B0' }}>{c.desc}</div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: `${c.badgeColor}18`, color: c.badgeColor }}>{c.badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket form */}
          <div className="rounded-2xl p-7" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-lg font-bold text-white mb-5" style={{ fontFamily: 'Space Grotesk, Inter, system-ui' }}>Open a ticket</h3>
            {sent ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <div className="text-3xl">✅</div>
                <p className="text-sm font-medium text-white">Ticket submitted!</p>
                <p className="text-xs" style={{ color: '#8B92B0' }}>We'll get back to you within 4 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleTicket} className="space-y-4">
                <input
                  type="text" required placeholder="Subject"
                  value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-[#8B92B0] outline-none text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(154,77,255,0.5)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                <textarea
                  required placeholder="Describe your issue..."
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-[#8B92B0] outline-none text-sm resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(154,77,255,0.5)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                <button type="submit" className="w-full py-3 rounded-xl text-white font-semibold text-sm" style={{ background: 'linear-gradient(90deg,#9A4DFF,#B566FF)', boxShadow: '0 8px 20px rgba(154,77,255,0.35)' }}>
                  Submit ticket
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
