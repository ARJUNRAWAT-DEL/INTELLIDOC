import React from 'react';
import Hero from '../components/Hero';

export default function Home() {
  // Background for the home page is handled by `PageShell` so the image
  // shows outside the white card container. Keep this page focused on content.
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <Hero />
      </div>
    </div>
  );
}
