import { useNavigate } from 'react-router-dom';
import ScreenshotCard from './ScreenshotCard';
import callersDemo from '../assets/callers-demo.svg';

const Hero = () => {
  const navigate = useNavigate();
  // hero does not animate an inline demo answer in this layout — keep the component lean

  return (
  <section className="py-20 bg-gradient-to-b from-sky-50 to-sky-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left content */}
          <div className="pt-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-gray-900">Summarize your documents instantly</h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 max-w-2xl">Upload any file and get a clear, source-backed summary in seconds. IntelliDoc reads your PDFs — making research easier.</p>

            <div className="mt-8 sm:mt-10 flex items-center gap-4">
              <button onClick={() => navigate('/summarize')} className="px-4 sm:px-6 py-3 sm:py-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg text-sm sm:text-base">Summarize your document →</button>
            </div>
          </div>

          {/* Right demo panel: screenshot card */}
          <div className="flex items-center justify-center">
            <div className="enter-slide-up">
              {/* Use new ScreenshotCard component for hero visual */}
              <div className="max-w-sm md:max-w-md lg:max-w-lg">
                <ScreenshotCard imageSrc={callersDemo} title="Callers" subtitle="WEBSITE" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
