import React, {useState} from 'react';

interface PhoneMockupProps {
  imageUrl?: string;
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({ imageUrl = '/phone-demo.png' }) => {
  const [showImage, setShowImage] = useState(true);

  return (
  <div className="relative w-36 sm:w-44 md:w-56 lg:w-64">
      <div className="relative mx-auto" style={{perspective: 900}}>
        <div className="relative bg-gradient-to-br from-white to-slate-50 phone-frame-rounded p-1 phone-outer-shadow" style={{border: '1px solid rgba(255,255,255,0.6)'}}>
          <div className="bg-white rounded-lg overflow-hidden" style={{height: '100%'}}>
            {/* phone frame */}
            <div className="relative rounded-lg bg-gradient-to-b from-gray-50 to-white" style={{paddingTop: '200%', position: 'relative'}}>
              {/* screen area */}
              <div className="absolute inset-6 rounded-md overflow-hidden bg-gradient-to-tr from-slate-50 to-white shadow-inner phone-screen-pulse" style={{display: 'flex'}}>
                <div className="w-full h-full relative flex items-center justify-center">
                  {showImage ? (
                    // Try to load an image from the given imageUrl (defaults to /phone-demo.png).
                    // If the file is not present the image's onError will hide it and show the fallback.
                    <div className="w-full h-full relative">
                      <img
                        src={imageUrl}
                        alt="demo"
                        onError={() => setShowImage(false)}
                        className="w-full h-full object-cover ken-burns"
                        style={{display: 'block'}}
                      />
                      {/* gradient overlay for legibility */}
                      <div className="phone-gradient-top" />

                      {/* Overlay area centered vertically - tagline only (logo removed) */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col items-center gap-3 px-4">
                              <div className="phone-overlay-hero max-w-[82%] leading-tight text-center text-sm sm:text-base md:text-lg">
                                Your AI That Reads So You Don’t Have To
                              </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-36 bg-gradient-to-b from-white to-slate-100 rounded-md border border-gray-100 flex items-center justify-center text-sm text-gray-500">Demo</div>
                  )}
                </div>
              </div>
              {/* notch */}
              <div className="absolute left-1/2 transform -translate-x-1/2 top-2 w-20 h-2 bg-black/5 rounded-full" />
            </div>
          </div>
        </div>

        {/* small floating shadow */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-gradient-to-r from-blue-100 to-indigo-100 opacity-30 rounded-full blur-sm" />
      </div>
    </div>
  );
};

export default PhoneMockup;
