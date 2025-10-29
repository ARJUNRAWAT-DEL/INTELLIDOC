import React from 'react';
import ScreenshotCarousel from './ScreenshotCarousel';
import PhoneMockup from './PhoneMockup';

interface Props {
  title?: string;
  subtitle?: string;
  imageSrc?: string | undefined;
}

const ScreenshotCard: React.FC<Props> = ({ title = 'Callers', subtitle = 'WEBSITE', imageSrc }) => {
  return (
    <div className="relative w-full">
      <div className="rounded-4xl overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 shadow-md sm:shadow-4xl">
  <div className="relative bg-gradient-to-br from-sky-100 to-sky-300 p-6 sm:p-8 flex items-center justify-center min-h-[300px] sm:min-h-[420px]">
    {/* decorative blobs - hide on small screens to avoid large blurred overlays */}
    <div className="hidden sm:block absolute -left-12 -top-10 w-56 sm:w-72 h-56 sm:h-72 bg-gradient-to-br from-indigo-300 to-sky-300 opacity-40 rounded-3xl filter blur-2xl sm:blur-3xl animate-blob" />
    <div className="hidden sm:block absolute right-6 sm:right-8 bottom-4 w-40 sm:w-56 h-40 sm:h-56 bg-white/10 rounded-3xl filter blur-xl sm:blur-2xl opacity-60 animate-float" />

          {/* big centered phone */}
          <div className="relative z-10 scale-95 md:scale-100">
            {/* Use external realistic phone demo image from Pexels and show overlay text */}
            <PhoneMockup imageUrl="https://images.pexels.com/photos/1802268/pexels-photo-1802268.jpeg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotCard;
