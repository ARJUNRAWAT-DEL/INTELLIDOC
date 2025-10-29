import React from 'react';
// Navbar and Footer are provided by the app shell
import { Link } from 'react-router-dom';

const PersonalHome: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-extrabold leading-tight text-gray-900">Arjun Rawat</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-xl">AI Engineer & Full‑stack Developer building practical tools that bridge research and production. I focus on semantic search, document understanding and developer experience.</p>

            <div className="mt-8 flex gap-3">
              <Link to="/personal/projects" className="px-5 py-3 bg-purple-600 text-white rounded shadow">View projects</Link>
              <Link to="/personal/contact" className="px-5 py-3 border rounded">Get in touch</Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <span className="text-xs px-3 py-1 bg-gray-100 rounded">React</span>
              <span className="text-xs px-3 py-1 bg-gray-100 rounded">TypeScript</span>
              <span className="text-xs px-3 py-1 bg-gray-100 rounded">FastAPI</span>
              <span className="text-xs px-3 py-1 bg-gray-100 rounded">AI / NLP</span>
              <span className="text-xs px-3 py-1 bg-gray-100 rounded">Tailwind</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg border">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold mx-auto">AR</div>
              <div className="text-center mt-4 text-sm text-gray-600">Hi — I build AI-first developer tools and production ML systems. This site is a starter template — customize it with your projects and content.</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PersonalHome;
