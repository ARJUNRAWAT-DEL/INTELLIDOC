import React from 'react';
import PhoneMockup from './PhoneMockup';

const ScreenshotCard: React.FC = () => {
  return (
    <div className="relative w-full flex items-center justify-center">
      {/* Phone mockup - no background box */}
      <div className="relative z-10 scale-95 md:scale-100">
        <PhoneMockup />
      </div>
    </div>
  );
};

export default ScreenshotCard;
