import { useEffect, useState } from 'react';

const slides = [
  // simple SVG placeholders representing screenshots
  <svg key="s1" viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="0" y="0" width="100%" height="100%" rx="12" fill="#ffffff" stroke="#eef2ff"/>
    <rect x="16" y="20" width="120" height="160" rx="8" fill="#f8fafc" stroke="#eef2ff" />
    <rect x="148" y="20" width="196" height="28" rx="6" fill="#f1f5f9" />
    <rect x="148" y="56" width="180" height="12" rx="6" fill="#e6eef8" />
    <rect x="148" y="76" width="160" height="12" rx="6" fill="#e6eef8" />
    <rect x="148" y="98" width="120" height="12" rx="6" fill="#f1f5f9" />
    <g>
      <rect x="148" y="130" width="80" height="14" rx="7" fill="#fff7fe" stroke="#fdecec" />
    </g>
  </svg>,

  <svg key="s2" viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="0" y="0" width="100%" height="100%" rx="12" fill="#ffffff" stroke="#f0fdf4"/>
    <rect x="20" y="18" width="320" height="28" rx="6" fill="#ecfdf5" />
    <rect x="28" y="56" width="300" height="12" rx="6" fill="#d1fae5" />
    <rect x="28" y="76" width="260" height="12" rx="6" fill="#ecfdf5" />
    <rect x="28" y="98" width="300" height="68" rx="6" fill="#f8fafc" />
    <rect x="28" y="176" width="120" height="12" rx="6" fill="#e6f9f0" />
  </svg>,

  <svg key="s3" viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="0" y="0" width="100%" height="100%" rx="12" fill="#ffffff" stroke="#fff1f2"/>
    <rect x="20" y="18" width="320" height="180" rx="10" fill="#fff7fb" />
    <rect x="36" y="36" width="280" height="12" rx="6" fill="#fce7f3" />
    <rect x="36" y="58" width="240" height="12" rx="6" fill="#fde8f5" />
    <rect x="36" y="80" width="160" height="12" rx="6" fill="#fff" />
    <rect x="36" y="104" width="300" height="12" rx="6" fill="#fff" />
    <rect x="36" y="132" width="200" height="12" rx="6" fill="#fff" />
  </svg>,
];

export default function ScreenshotCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full h-full relative">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`carousel-slide absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          {s}
        </div>
      ))}

      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}`} className={`w-2 h-2 rounded-full ${i === index ? 'bg-purple-600' : 'bg-white/60 border'} border-white`} />
        ))}
      </div>
    </div>
  );
}
