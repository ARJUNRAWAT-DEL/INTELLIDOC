import React, { useState } from 'react';
// Navbar and Footer are provided by the app shell

const ContactPersonal: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: open mail client
    window.location.href = `mailto:arjun@example.com?subject=${encodeURIComponent('Contact from personal site')}&body=${encodeURIComponent(`${name} (${email})\n\n${message}`)}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-4">Get in touch</h2>
        <p className="text-gray-700 mb-6">Feel free to reach out — this form opens your email client for demo purposes.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
          </div>
          <div>
            <label className="text-sm">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
          </div>
          <div>
            <label className="text-sm">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" rows={6} />
          </div>
          <div>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">Send</button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ContactPersonal;
