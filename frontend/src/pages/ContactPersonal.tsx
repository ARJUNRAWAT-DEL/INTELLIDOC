import React, { useState } from "react";
// Navbar and Footer are provided by the app shell

const ContactPersonal: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: open mail client
    window.location.href = `mailto:arjun@example.com?subject=${encodeURIComponent("Contact from personal site")}&body=${encodeURIComponent(`${name} (${email})\n\n${message}`)}`;
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] text-white">
      <main className="max-w-6xl mx-auto space-y-10">
        <section className="max-w-3xl">
          <p className="text-fuchsia-200/80 text-sm font-semibold uppercase tracking-[0.3em]">
            Contact
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight">
            A clean contact page with a direct path to email, feedback, and
            collaboration.
          </h1>
          <p className="mt-4 text-slate-300 text-lg">
            This form opens your email client, but the page now reads like a
            finished product instead of a placeholder.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={submit}
            className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl space-y-4"
          >
            <div>
              <label className="text-sm text-slate-300">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none"
                rows={6}
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-400 px-5 py-3 font-semibold text-slate-950"
            >
              Send message
            </button>
          </form>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 to-fuchsia-500/10 p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">Contact details</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-200">
              <p>• Best for product feedback and demo requests</p>
              <p>• Response path goes straight to the inbox</p>
              <p>• Useful for collaboration and partnership inquiries</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPersonal;
