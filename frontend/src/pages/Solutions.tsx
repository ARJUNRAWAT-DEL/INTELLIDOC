export default function Solutions() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold">Solutions</h1>
        <p className="mt-3 text-gray-600">Persona-driven pages: Legal, Healthcare, Developers — tailored copy and examples.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-white rounded-xl shadow">Legal</div>
          <div className="p-6 bg-white rounded-xl shadow">Healthcare</div>
          <div className="p-6 bg-white rounded-xl shadow">Developers</div>
        </div>
      </div>
    </div>
  );
}
