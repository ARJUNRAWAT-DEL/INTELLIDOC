import React, { useState, useEffect } from "react";

interface MobileMockupProps {
  className?: string;
}

const MobileMockup: React.FC<MobileMockupProps> = ({ className = "" }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState("");

  const steps = [
    {
      title: "Upload Document",
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-2">Upload Document</div>
            <div className="text-lg font-semibold text-white">Contract.pdf</div>
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-center text-slate-400">
              {progress}%
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "AI Processing",
      content: (
        <div className="space-y-3">
          <div className="text-sm text-slate-400 mb-3">Reading document...</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <div className="text-sm text-white">Extracting key points...</div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
              <div className="text-sm text-white">Finding citations...</div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                style={{ animationDelay: "1s" }}
              />
              <div className="text-sm text-white">Analyzing structure...</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Summary Generated",
      content: (
        <div className="space-y-3">
          <div className="text-sm text-slate-400 mb-2">Summary</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span className="text-white">Payment deadline: 30 days</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span className="text-white">Renewal clause included</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span className="text-white">Termination requires notice</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-3">
            Sources: Page 2, Page 5
          </div>
        </div>
      ),
    },
    {
      title: "Ask AI",
      content: (
        <div className="space-y-3">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">You</div>
            <div className="text-sm text-white">
              What is the cancellation policy?
            </div>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-lg p-3">
            <div className="text-xs text-cyan-400 mb-1">IntelliDoc AI</div>
            <div className="text-sm text-white">
              The contract requires 14 days notice before cancellation.
              <span className="text-xs text-slate-400 block mt-1">
                Source: Page 5
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [steps.length]);

  useEffect(() => {
    if (currentStep === 0) {
      setProgress(0);
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
    }
  }, [currentStep]);

  return (
    <div className={`relative ${className}`}>
      {/* Phone Frame */}
      <div className="relative mx-auto w-80 h-[40rem] sm:w-72 md:w-80 bg-black rounded-[2.5rem] border-4 border-slate-700 shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-10" />

        {/* Screen */}
        <div className="relative w-full h-full bg-slate-900 rounded-[2rem] overflow-hidden">
          {/* Status Bar */}
          <div className="flex justify-between items-center px-4 py-2 text-xs text-white bg-slate-800">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 bg-slate-600 rounded-sm" />
              <div className="w-3 h-2 bg-slate-600 rounded-sm" />
              <span>100%</span>
            </div>
          </div>

          {/* App Header */}
          <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <div>
                <div className="text-white font-semibold text-sm">
                  IntelliDoc
                </div>
                <div className="text-xs text-slate-400">
                  AI Document Assistant
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 h-full overflow-hidden">
            <div
              key={currentStep}
              className="animate-in slide-in-from-bottom-4 duration-500"
            >
              {steps[currentStep].content}
            </div>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full" />
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-cyan-400/5 blur-3xl rounded-full scale-110 -z-10" />
    </div>
  );
};

export default MobileMockup;
