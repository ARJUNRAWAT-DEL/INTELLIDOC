import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const personaExamples: Record<string, { label: string; example: string }> = {
  legal: { label: 'Legal', example: 'Summarize the contract and list renewal clauses.' },
  finance: { label: 'Finance', example: 'List invoice amounts and due dates.' },
  ops: { label: 'Operations', example: 'Extract SLA and uptime commitments.' }
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [persona, setPersona] = useState<string | null>(null);
  const [sampleQuery, setSampleQuery] = useState('');
  const [uploadTaskId, setUploadTaskId] = useState<string | null>(null);
  const [uploadFilename, setUploadFilename] = useState<string | null>(null);
  const [uploadedDocumentId, setUploadedDocumentId] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (persona && personaExamples[persona]) setSampleQuery(personaExamples[persona].example);
  }, [persona]);

  // Gate onboarding behind authentication: if there's no token and no local user, redirect to login
  useEffect(() => {
    const token = ApiService.getToken();
    let hasLocalUser = false;
    try {
      const raw = localStorage.getItem('intellidoc_user');
      if (raw) {
        const u = JSON.parse(raw);
        hasLocalUser = !!(u && (u.email || u.name));
      }
    } catch (e) {
      hasLocalUser = false;
    }

    if (!token && !hasLocalUser) {
      // Redirect to login and include return path
      navigate('/login', { state: { next: '/onboarding' } });
    }
  }, [navigate]);

  const choosePersona = (p: string) => {
    setPersona(p);
    setStep(2);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const upload = await ApiService.uploadFile(file);
      // upload returns task id — store it for onboarding state
      setUploadTaskId(upload.task_id || null);
      setUploadStatus(upload.status || 'queued');
      setUploadFilename(file.name);
      setStep(3);
    } catch (err: any) {
      setMessage('Upload failed: ' + (err?.message || String(err)));
    }
  };

  // Poll upload status when a task id is present
  useEffect(() => {
    if (!uploadTaskId) return;

    let cancelled = false;
    const startTime = Date.now();
    setUploadStatus('processing');

    const pollOnce = async () => {
      try {
        const status = await ApiService.getUploadStatus(uploadTaskId);
        if (cancelled) return;

        // Update friendly status
        setUploadStatus(status.status || null);

        if (status.status === 'completed') {
          if (status.result && (status.result as any).document_id) {
            setUploadedDocumentId((status.result as any).document_id);
            setMessage('Upload processed — document indexed.');
          } else {
            setMessage('Upload processed.');
          }
          return true;
        }

        if (status.status === 'failed') {
          setMessage('Upload processing failed: ' + (status.message || 'unknown'));
          return true;
        }

        // continue polling
        setMessage(`Processing upload… ${Math.round((status.progress || 0))}%`);
        return false;
      } catch (err: any) {
        setMessage('Failed to get upload status: ' + (err?.message || String(err)));
        return true;
      }
    };

    // Start an immediate poll then interval
    let stopped = false;
    (async () => {
      const done = await pollOnce();
      if (done) stopped = true;
    })();

    const interval = setInterval(async () => {
      if (cancelled || stopped) return;
      if (Date.now() - startTime > 120000) { // timeout after 2 minutes
        setUploadStatus('timeout');
        setMessage('Upload processing timed out.');
        clearInterval(interval);
        return;
      }
      const done = await pollOnce();
      if (done) {
        clearInterval(interval);
      }
    }, 1000);

    return () => { cancelled = true; clearInterval(interval); };
  }, [uploadTaskId]);

  const runSample = async () => {
    setMessage(null);
    try {
      const q = sampleQuery || personaExamples[persona || 'legal'].example;
      const res = await ApiService.search(q, 5, 0);
      // show result summary in message area (simple)
      setMessage('Sample run completed — answer preview below.');
      // optionally display results — for now keep simple
      console.log('Onboarding sample run', res);
    } catch (err: any) {
      setMessage('Sample run failed: ' + (err?.message || String(err)));
    }
  };

  const saveOnboarding = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // try to determine current user email from localStorage
      let userEmail: string | null = null;
      try {
        const raw = localStorage.getItem('intellidoc_user');
        if (raw) {
          const u = JSON.parse(raw);
          userEmail = u?.email || null;
        }
      } catch (e) {
        userEmail = null;
      }

      if (!userEmail) {
        // fallback: ask user for email via prompt (minimal UX)
        // In production you'd show a proper modal
        // eslint-disable-next-line no-alert
        const promptEmail = window.prompt('Please enter your email to save onboarding:');
        if (!promptEmail) {
          setMessage('Email required to save onboarding.');
          setSaving(false);
          return;
        }
        userEmail = promptEmail;
      }

      const payload = {
        user_email: userEmail,
        persona: persona,
        sample_query: sampleQuery,
        upload_filename: uploadFilename,
        upload_task_id: uploadTaskId,
        uploaded_document_id: uploadedDocumentId,
        completed: true,
        meta: { saved_at: new Date().toISOString() }
      };

      const res = await ApiService.saveOnboarding(payload as any);
      console.log('Saved onboarding', res);
      setMessage('Onboarding saved. You can continue to the dashboard.');
      setSaving(false);
    } catch (err: any) {
      setMessage('Failed to save onboarding: ' + (err?.message || String(err)));
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Welcome — let's get you set up</h2>

        {step === 1 && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">Choose the persona that best matches your use case. This will prefill helpful queries.</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {Object.keys(personaExamples).map((k) => (
                <button key={k} onClick={() => choosePersona(k)} className="p-4 border rounded-lg text-left hover:shadow">
                  <div className="font-semibold">{personaExamples[k].label}</div>
                  <div className="text-xs text-gray-500 mt-2">Example: <span className="italic">{personaExamples[k].example}</span></div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setStep(2)} className="px-4 py-2 rounded-md border">Skip and upload</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">Upload a sample document (PDF, DOCX, or TXT) so we can index and show results.</div>
            <div className="mt-4">
              <input type="file" onChange={handleFile} className="block" />
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(1)} className="px-4 py-2 rounded-md border">Back</button>
              <button onClick={() => setStep(3)} className="px-4 py-2 rounded-md bg-[var(--accent-pink)] text-white">Skip upload → Preview</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">Preview results. You can edit the sample query below and run it.</div>
            <textarea value={sampleQuery} onChange={(e) => setSampleQuery(e.target.value)} rows={3} className="w-full rounded-md border p-3" />
            <div className="flex gap-3">
              <button onClick={runSample} className="px-4 py-2 rounded-md bg-[var(--nav-green)] text-white">Run sample</button>
              <button onClick={() => setStep(2)} className="px-4 py-2 rounded-md border">Back</button>
            </div>
            <div className="mt-4">
              <button onClick={saveOnboarding} disabled={saving} className="px-4 py-2 rounded-md bg-[var(--accent-pink)] text-white">{saving ? 'Saving…' : 'Save onboarding & continue'}</button>
              <button onClick={() => navigate('/dashboard')} className="ml-3 px-4 py-2 rounded-md border">Skip</button>
            </div>
            {message && <div className="mt-3 text-sm text-gray-700">{message}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
