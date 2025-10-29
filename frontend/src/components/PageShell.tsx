import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PageShell: React.FC<{children: React.ReactNode}> = ({children}) => {
  const location = useLocation();
  const path = location.pathname || '';
  // Disable the entrance/background animation for specific pages
  const disableAnimationFor = ['/how-it-works'];
  const disableAnim = disableAnimationFor.some(p => path === p || path.startsWith(p + '/'));

  // Background handling: for the home page, try to use a local `public/home-bg.jpg` and fall back to a remote image.
  const [bgUrl, setBgUrl] = useState<string | null>(null);

  useEffect(() => {
    // Apply the same outer background for all pages. Probe the local image and
    // fall back to a remote image if the local file is missing.
    const local = '/home-bg.jpg';
    const remote = 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
    const img = new Image();
    img.src = local;
    img.onload = () => setBgUrl(local);
    img.onerror = () => setBgUrl(remote);
    // No cleanup necessary; keep the background stable as user navigates.
  }, [path]);

  const outerStyle: React.CSSProperties | undefined = bgUrl
    ? { backgroundImage: `linear-gradient(rgba(230,246,255,0.55), rgba(255,255,255,0.6)), url('${bgUrl}')` }
    : undefined;

  return (
    <div
      className={`min-h-[calc(100vh-72px)] bg-[linear-gradient(180deg,#f6f9ff,white)] ${disableAnim ? '' : 'animate-gradient-shift'}`}
      style={outerStyle}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* card container that matches the showcased design */}
        <div className={`bg-white rounded-4xl p-8 shadow-md sm:shadow-4xl ${disableAnim ? '' : 'enter-slide-up'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageShell;
