import { useEffect, useState } from 'react';

interface Props {
  modal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

// Per-step SVG icons (document-focused style)
function StepIcon({ index }: { index: number }) {
  if (index === 0) {
    // Upload icon
    return (
      <div className="flex items-center justify-center mb-4">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-float">
          <rect x="6" y="14" width="60" height="44" rx="8" fill="#ECFDF5" stroke="#D1FAE5" />
          <path d="M36 20v20" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M28 28l8-8 8 8" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (index === 1) {
    // Search icon
    return (
      <div className="flex items-center justify-center mb-4">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-float">
          <circle cx="32" cy="32" r="18" fill="#F5F3FF" stroke="#E9D5FF" />
          <path d="M44 44l12 12" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />
          <rect x="16" y="16" width="6" height="6" rx="1" fill="#7C3AED" />
        </svg>
      </div>
    );
  }
  // index === 2 Answer icon
  return (
    <div className="flex items-center justify-center mb-4">
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-float">
        <rect x="8" y="12" width="56" height="48" rx="8" fill="#FFF1F2" stroke="#FDE2EC" />
        <path d="M22 26h28" stroke="#DB2777" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 34h20" stroke="#DB2777" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="44" r="4" fill="#DB2777" />
      </svg>
    </div>
  );
}

// Inline professional SVG (document-focused) used in right column
function DocumentHeroSVG() {
  return (
    <div className="w-full flex items-center justify-center">
      <svg viewBox="0 0 240 240" width="220" height="220" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <rect x="14" y="34" width="160" height="120" rx="12" fill="#F8FAFC" stroke="#E6EEF3" />
        <path d="M28 52h128" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
        <path d="M28 72h96" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
        <g transform="translate(120, 28)">
          <circle cx="48" cy="48" r="36" fill="url(#g1)" opacity="0.12" />
          <path d="M36 44h24M36 56h12" stroke="#0EA5A4" strokeWidth="3" strokeLinecap="round" />
          <rect x="6" y="86" width="84" height="36" rx="6" fill="#fff" stroke="#E6EEF3" />
        </g>
        <g transform="translate(28, 160)">
          <rect x="0" y="0" width="184" height="40" rx="8" fill="#fff" stroke="#E6EEF3" />
          <path d="M12 12h60" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <path d="M12 26h100" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

export default function HowItWorks(props: Props) {
  const { modal = false, isOpen = true, onClose } = props;
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState('Summarize the attached contract in 2 bullet points');
  const [answer, setAnswer] = useState('');
  const [LottieComp, setLottieComp] = useState<any>(null);
  const [animData, setAnimData] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setStep(s => (s + 1) % 3), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // try to dynamically import lottie-react; if unavailable, fail silently
    let mounted = true;
    // Avoid Vite's static analysis by constructing the package name at runtime
    // so the dev server won't pre-resolve this optional dependency.
    const _pkg: any = 'lottie' + '-react';
    // use Vite ignore comment to suppress analysis warning for this dynamic import
    // the import will be attempted at runtime; if the package isn't installed it will fail and be ignored
    import(/* @vite-ignore */ _pkg)
      .then((mod) => { if (mounted) setLottieComp(() => mod.default); })
      .catch(() => { /* optional dependency - ignore */ });
    // fetch a small Lottie json from public CDN (will fail if offline)
    fetch('https://assets6.lottiefiles.com/packages/lf20_touohxv0.json')
      .then(r => r.json())
      .then(j => { if (mounted) setAnimData(j); })
      .catch(() => { /* ignore */ });
    return () => { mounted = false; };
  }, []);

  // lock body scroll when modal is open
  useEffect(() => {
    if (!modal) return;
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [modal, isOpen]);

  const runExample = async () => {
    setAnswer('');
    const simulated = '• Key obligation: Payment due within 30 days.\n• Term: Automatic renewal unless terminated.';
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setAnswer(simulated.slice(0, i));
      if (i >= simulated.length) clearInterval(t);
    }, 20);
  };

  const content = (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <header className="p-6 border-b flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">How IntelliDoc Works</h1>
          <p className="mt-1 text-sm text-gray-600">A short guided tour with animations and a small interactive example.</p>
        </div>
        <div className="flex items-center gap-3">
          {LottieComp && animData ? (
            // @ts-ignore - dynamic component
            <LottieComp animationData={animData} loop={true} style={{ width: 120, height: 120 }} />
          ) : (
            <div className="w-28 h-28 bg-gradient-to-br from-green-200 to-pink-200 rounded-lg flex items-center justify-center text-sm text-gray-700">Demo</div>
          )}
          {modal && <button onClick={onClose} className="px-3 py-2 rounded-md bg-gray-100">Close</button>}
        </div>
      </header>

      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: main content spans two columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="text-lg font-bold mb-3">At a glance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0,1,2].map(i => (
                  <div key={i} className={`p-6 rounded-xl border bg-white ${step === i ? 'shadow-xl scale-105 border-green-200' : 'border-gray-100'} transition-all animate-slide-in`} style={{ animationDelay: `${i * 120}ms` }}>
                    <StepIcon index={i} />
                    <div className="text-sm font-semibold mb-1">{i===0 ? 'Upload' : i===1 ? 'Search' : 'Answer'}</div>
                    <p className="text-sm text-gray-600">{i===0 ? 'Drag & drop PDFs, Word docs — IntelliDoc extracts text.' : i===1 ? 'Ask natural-language questions — embeddings find relevant passages.' : 'Receive concise, sourced answers with links back to documents.'}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">Interactive example</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-100">
                  <div className="text-sm text-gray-500 mb-2">Example query</div>
                  <textarea value={query} onChange={(e) => setQuery(e.target.value)} className="w-full p-2 rounded-md border border-gray-200 h-28" />
                  <div className="mt-3 flex gap-2">
                    <button onClick={runExample} className="px-3 py-2 bg-[var(--nav-green)] text-white rounded-md text-sm">Run query</button>
                    <button onClick={() => { setQuery('Find all clauses about termination and summarize in 3 bullets'); setAnswer(''); }} className="px-3 py-2 border rounded-md text-sm">Load example</button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">This demo is local and simulates the real answer.</div>
                </div>

                <div className="p-4 rounded-xl border border-gray-100 flex flex-col">
                  <div className="text-sm text-gray-500 mb-2">AI answer</div>
                  <div className="flex-1 bg-gray-50 p-3 rounded-md border border-dashed border-gray-200 overflow-auto whitespace-pre-wrap text-gray-800">{answer || <span className="text-gray-400">Run the example to see a simulated answer appear here.</span>}</div>
                  <div className="mt-2 text-xs text-gray-500">Real answers include document sources and timestamps.</div>
                </div>
              </div>
            </section>
          </div>

          {/* Right: professional document-focused illustration */}
          <aside className="hidden lg:flex lg:flex-col lg:items-center lg:justify-start">
            <div className="w-full p-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg animate-pulse-soft">
                <DocumentHeroSVG />
                <h3 className="mt-4 text-lg font-bold text-gray-900">Document intelligence</h3>
                <p className="mt-2 text-sm text-gray-600">Visualize how IntelliDoc extracts, indexes and surfaces answers from your documents.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );

  if (modal) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center py-12">
        <div onClick={onClose} className="absolute inset-0 bg-black/40" />
        {/* Modal shell: allow scrolling inside modal and limit height */}
        <div className="relative w-full max-w-5xl mx-4 max-h-[85vh] overflow-auto rounded-lg">{content}</div>
        <style>{`
          @keyframes float { 0% { transform: translateY(0) } 50% { transform: translateY(-6px) } 100% { transform: translateY(0) } }
          @keyframes pulse { 0% { transform: scale(1); opacity: .95 } 50% { transform: scale(1.02); opacity: 1 } 100% { transform: scale(1); opacity: .95 } }
          @keyframes slide-in { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
          .animate-float { animation: float 4s ease-in-out infinite; }
          .animate-pulse-soft { animation: pulse 3s ease-in-out infinite; }
          .animate-slide-in { animation: slide-in .45s cubic-bezier(.2,.8,.2,1) both; }
        `}</style>
      </div>
    );

  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8">{content}</div>
  );
}
