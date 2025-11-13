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
    <div className="relative w-full flex items-center justify-center">
      {/* Phone mockup - no background box */}
      <div className="relative z-10 scale-95 md:scale-100">
        <PhoneMockup imageUrl="https://images.pexels.com/photos/1802268/pexels-photo-1802268.jpeg" />
      </div>
    </div>
  );
};

export default ScreenshotCard;
