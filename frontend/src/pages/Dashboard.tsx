import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const stats = [
  { label: 'Documents Uploaded', value: '0', icon: '📄', color: '#9A4DFF', glow: 'rgba(154,77,255,0.3)' },
  { label: 'Queries Asked', value: '0', icon: '💬', color: '#4F9CFF', glow: 'rgba(79,156,255,0.3)' },
  { label: 'Time Saved', value: '0h', icon: '⚡', color: '#34D399', glow: 'rgba(52,211,153,0.3)' },
  { label: 'Accuracy Rate', value: '98%', icon: '🎯', color: '#F59E0B', glow: 'rgba(245,158,11,0.3)' },
];

const quickActions = [
  { label: 'Upload Document', desc: 'Add PDFs, Word docs, or text files', icon: '⬆️', to: '/summarize' },
  { label: 'Search Documents', desc: 'Ask AI questions across your library', icon: '🔍', to: '/summarize' },
  { label: 'View Library', desc: 'Browse all your uploaded documents', icon: '📚', to: '/summarize' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('intellidoc_user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) { /* ignore */ }
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div
      className="min-h-screen"
    >
      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(154,77,255,0.08) 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(79,156,255,0.07) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#9A4DFF] to-[#4F9CFF] flex items-center justify-center text-lg font-bold text-white shadow-lg">
              {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="text-sm" style={{ color: '#8B92B0' }}>{greeting()},</p>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, Inter, system-ui', letterSpacing: '-0.02em' }}>
                {user?.name ?? user?.email ?? 'User'} 👋
              </h1>
            </div>
          </div>
          <p className="mt-3 text-sm" style={{ color: '#8B92B0' }}>Here's your IntelliDoc workspace. Upload documents and extract insights instantly.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-5 transition-all duration-300 group cursor-default"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.border = `1px solid ${stat.color}40`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px ${stat.glow}`;
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
              }}
            >
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold mb-1" style={{ color: stat.color, fontFamily: 'Space Grotesk, Inter, system-ui' }}>{stat.value}</div>
              <div className="text-xs font-medium" style={{ color: '#8B92B0' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick actions */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, Inter, system-ui' }}>Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.to)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(154,77,255,0.08)';
                    (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(154,77,255,0.3)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                    (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(0)';
                  }}
                >
                  <span className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ background: 'rgba(154,77,255,0.1)' }}>{action.icon}</span>
                  <div>
                    <div className="font-semibold text-white text-sm">{action.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#8B92B0' }}>{action.desc}</div>
                  </div>
                  <div className="ml-auto" style={{ color: '#8B92B0' }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Getting started panel */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, Inter, system-ui' }}>Get Started</h2>
            <div
              className="rounded-2xl p-6 h-full relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(154,77,255,0.15) 0%, rgba(79,156,255,0.1) 100%)',
                border: '1px solid rgba(154,77,255,0.2)',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(154,77,255,0.2)' }} />
              <div className="relative z-10">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="font-bold text-white text-base mb-2">Upload your first document</h3>
                <p className="text-sm mb-5" style={{ color: '#D4D8E8' }}>
                  Supports PDFs, Word docs, and text files up to 50MB. Get instant AI summaries and answers.
                </p>
                <button
                  onClick={() => navigate('/summarize')}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all"
                  style={{
                    background: 'linear-gradient(90deg, #9A4DFF, #B566FF)',
                    boxShadow: '0 8px 24px rgba(154,77,255,0.4)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                >
                  Upload Document →
                </button>
                <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: '#8B92B0' }}>
                  <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ color: '#34D399' }}>End-to-end encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity placeholder */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, Inter, system-ui' }}>Recent Activity</h2>
          <div
            className="rounded-2xl p-8 flex flex-col items-center justify-center text-center"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              minHeight: '140px',
            }}
          >
            <div className="text-4xl mb-3 opacity-40">📭</div>
            <p className="font-medium text-white opacity-50 text-sm">No activity yet</p>
            <p className="text-xs mt-1" style={{ color: '#8B92B0' }}>Upload a document to see your activity here</p>
          </div>
        </div>
      </div>
    </div>
  );
}

