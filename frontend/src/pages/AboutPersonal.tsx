import React from 'react';

const AboutPersonal: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-4">About me</h2>
        <p className="text-gray-700 leading-relaxed">I'm a software engineer focused on building AI systems that solve real problems. I have experience in NLP, semantic search, and deploying models to production. My work sits at the intersection of research and product — I enjoy shipping usable tools that help teams make better decisions from documents.</p>

        <section className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Experience</h3>
          <ul className="list-disc ml-5 text-gray-700">
            <li>Built a document intelligence platform with FastAPI, Postgres, and embedding search.</li>
            <li>Produced production-ready pipelines for extracting, chunking and indexing documents.</li>
          </ul>
        </section>
  </main>
    </div>
  );
};

export default AboutPersonal;
