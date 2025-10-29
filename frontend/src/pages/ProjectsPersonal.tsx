import React from 'react';
// Navbar and Footer are rendered globally in the app shell

const projects = [
  { id: 1, title: 'IntelliDoc', desc: 'Document summarization and semantic search platform.' },
  { id: 2, title: 'Project Atlas', desc: 'Knowledge graph toolkit for enterprise data.' },
  { id: 3, title: 'CLI Tools', desc: 'Developer productivity CLIs and utilities.' },
];

const ProjectsPersonal: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-6">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p.id} className="p-5 border rounded-lg shadow-sm bg-white">
              <div className="font-semibold mb-2">{p.title}</div>
              <div className="text-sm text-gray-600">{p.desc}</div>
              <div className="mt-4"><button className="text-sm px-3 py-2 bg-purple-600 text-white rounded">View</button></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProjectsPersonal;
