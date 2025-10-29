import React, { useEffect, useState } from 'react';
import OnboardingPage from '../pages/Onboarding';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: Props) {
  // simple body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-w-3xl w-full mx-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">Get started — Onboarding</h3>
            <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">✕</button>
          </div>
          <div className="p-6">
            {/* Render the onboarding page content but hide its top-level wrapper since it's already centered */}
            <OnboardingPage />
          </div>
        </div>
      </div>
    </div>
  );
}
