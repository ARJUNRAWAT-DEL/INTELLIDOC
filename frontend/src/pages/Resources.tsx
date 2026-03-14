import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const tabs = ['All', 'Guides', 'Case Studies', 'Tutorials', 'Changelog'];

const resources = [
  { type: 'Guide', tag: 'Guides', icon: '📘', title: 'Getting Started with IntelliDoc', desc: 'A step-by-step walkthrough for uploading your first document and running AI queries.', time: '5 min read', color: '#4F9CFF' },
  { type: 'Case Study', tag: 'Case Studies', icon: '⚖️', title: 'How LexCorp Cut Contract Review Time by 80%', desc: 'Learn how a mid-size law firm transformed their due diligence process using IntelliDoc AI.', time: '8 min read', color: '#9A4DFF' },
  { type: 'Tutorial', tag: 'Tutorials', icon: '🎓', title: 'Using the API: Python Quickstart', desc: 'Integrate IntelliDoc into your Python app in under 10 minutes with our official SDK.', time: '10 min read', color: '#34D399' },
  { type: 'Case Study', tag: 'Case Studies', icon: '🏥', title: 'MediScan Processes 10,000 Records/Day', desc: 'How a healthcare startup uses IntelliDoc to automate patient intake document processing.', time: '6 min read', color: '#EC4899' },
  { type: 'Guide', tag: 'Guides', icon: '🔐', title: 'Security & Compliance Best Practices', desc: 'Configure IntelliDoc for GDPR, HIPAA, and SOC 2 compliance in your organization.', time: '7 min read', color: '#F59E0B' },
  { type: 'Tutorial', tag: 'Tutorials', icon: '🔌', title: 'Webhook Integration Guide', desc: 'Receive real-time notifications when document processing completes using IntelliDoc webhooks.', time: '4 min read', color: '#8B5CF6' },
  { type: 'Changelog', tag: 'Changelog', icon: '🆕', title: 'v2.4 — Dual AI Answers, GROQ Integration', desc: 'This release adds GROQ-powered answers alongside local models, plus improved table extraction.', time: 'March 2026', color: '#4F9CFF' },
  { type: 'Guide', tag: 'Guides', icon: '🚀', title: 'Onboarding Your Team', desc: 'Invite teammates, set role permissions, and set up shared document libraries in minutes.', time: '4 min read', color: '#34D399' },
  { type: 'Tutorial', tag: 'Tutorials', icon: '📊', title: 'Extracting Tables from Financial Reports', desc: 'Use structured extraction to pull balance sheets and income statements into JSON or CSV.', time: '6 min read', color: '#9A4DFF' },
];

export default function Resources() {
  const [activeTab, setActiveTab] = useState('All');
  const navigate = useNavigate();

  const filtered = resources.filter((r) => activeTab === 'All' || r.tag === activeTab);

  return (
    <div className="min-h-screen">
      <div className="fixed bottom-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(154,77,255,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34D399' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] inline-block" />
            Knowledge base
          </div>
          <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, Inter, system-ui', letterSpacing: '-0.02em' }}>Resources & Guides</h1>
          <p className="text-lg" style={{ color: '#8B92B0' }}>Tutorials, case studies, and best practices to get the most out of IntelliDoc.</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all"
              style={activeTab === tab
                ? { background: 'linear-gradient(90deg,#9A4DFF,#B566FF)', color: '#fff', boxShadow: '0 4px 16px rgba(154,77,255,0.35)' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#8B92B0' }
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {filtered.map((res) => (
            <div
              key={res.title}
              className="rounded-2xl p-6 flex flex-col cursor-pointer transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.border = `1px solid ${res.color}35`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 30px ${res.color}15`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.08)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{res.icon}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: `${res.color}18`, color: res.color }}>{res.type}</span>
              </div>
              <h3 className="font-bold text-white text-sm mb-2 flex-1" style={{ fontFamily: 'Space Grotesk, Inter, system-ui' }}>{res.title}</h3>
              <p className="text-xs mb-4" style={{ color: '#8B92B0', lineHeight: '1.6' }}>{res.desc}</p>
              <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '12px' }}>
                <span className="text-xs" style={{ color: '#8B92B0' }}>{res.time}</span>
                <span className="text-xs font-semibold" style={{ color: res.color }}>Read →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter signup */}
        <div className="rounded-2xl p-10 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(79,156,255,0.08) 100%)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, Inter, system-ui' }}>Stay in the loop</h2>
          <p className="text-sm mb-6" style={{ color: '#8B92B0' }}>Get new guides, case studies, and product updates delivered to your inbox.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="your@email.com" className="flex-1 px-4 py-3 rounded-xl text-white placeholder-[#8B92B0] outline-none text-sm" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
            <button className="px-6 py-3 rounded-xl font-semibold text-white text-sm" style={{ background: 'linear-gradient(90deg,#34D399,#4F9CFF)', boxShadow: '0 8px 20px rgba(52,211,153,0.3)' }}>Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
}
