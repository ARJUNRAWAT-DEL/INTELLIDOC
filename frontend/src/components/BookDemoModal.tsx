import { useEffect, useRef, useState } from 'react';
import { ApiService } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookDemoModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) setSubmitted(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ApiService.bookDemo({ name, email, company });
      // If backend returns ok, show submitted
      if (res && res.ok) {
        setSubmitted(true);
      } else {
        // Still show success (graceful) but log backend response
        console.warn('Book demo response:', res);
        setSubmitted(true);
      }
    } catch (err) {
      // Show success path to avoid blocking UX, but log error for debugging
      console.warn('Book demo failed:', err);
      setSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div ref={modalRef} className="relative max-w-lg w-full bg-white rounded-2xl shadow-lg p-6 z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Book a demo</h2>
            <p className="text-sm text-gray-600 mt-1">Tell us a few details and we’ll send an invite.</p>
          </div>
          <button aria-label="Close" onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>

        {!submitted ? (
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium">Full name</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border p-3" />
            </div>
            <div>
              <label className="text-sm font-medium">Business email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border p-3" />
            </div>
            <div>
              <label className="text-sm font-medium">Company (optional)</label>
              <input value={company} onChange={e => setCompany(e.target.value)} className="mt-1 block w-full rounded-md border p-3" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <button type="submit" className="px-4 py-2 rounded-full bg-[var(--accent-pink)] text-white font-semibold">Request demo</button>
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="mt-6 text-center">
            <div className="text-lg font-bold">Thanks — request received</div>
            <div className="text-sm text-gray-600 mt-2">We’ll email you a calendar invite shortly.</div>
            <div className="mt-4">
              <button onClick={onClose} className="px-4 py-2 rounded-full bg-[var(--brand-900)] text-white">Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
