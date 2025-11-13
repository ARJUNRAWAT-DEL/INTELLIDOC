import { useNavigate } from 'react-router-dom';
import ScreenshotCard from './ScreenshotCard';
import callersDemo from '../assets/callers-demo.svg';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-slide-in-left lg:col-span-3">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-400/30 backdrop-blur-sm">
              <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-blue-300">AI-Powered Intelligence</span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black leading-[1.1] text-white mb-6">
                Summarize Your
                <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">Documents</span>
                <span className="block text-white">Instantly</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed font-light">
                Upload any file and get a clear, source-backed summary in seconds. IntelliDoc reads your PDFs, research papers, and documents — making complex information instantly accessible.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
              <button 
                onClick={() => navigate('/summarize')}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-premium hover:shadow-premium-lg btn-premium flex items-center gap-2"
              >
                <span>Start Summarizing</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              
              <button className="px-6 py-4 text-slate-300 font-semibold border-2 border-slate-600 rounded-xl hover:border-slate-400 hover:bg-slate-800/50 transition-all duration-300">
                View Demo
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-8 border-t border-slate-700">
              <div>
                <div className="text-2xl font-bold text-white">10K+</div>
                <p className="text-sm text-slate-400">Documents Processed</p>
              </div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div>
                <div className="text-2xl font-bold text-white">98%</div>
                <p className="text-sm text-slate-400">Accuracy Rate</p>
              </div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div>
                <div className="text-2xl font-bold text-white">&lt;2s</div>
                <p className="text-sm text-slate-400">Processing Time</p>
              </div>
            </div>
          </div>

          {/* Right demo panel */}
          <div className="flex items-center justify-center animate-slide-in-right animation-delay-300 lg:col-span-2">
            <div className="relative w-full">
              {/* Card */}
              <div className="relative">
                <ScreenshotCard imageSrc={callersDemo} title="AI Summarization" subtitle="In Action" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
