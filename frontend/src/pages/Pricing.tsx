export default function Pricing() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold">Pricing</h1>
        <p className="mt-3 text-gray-600">Simple plans for teams. Monthly and annual billing toggle coming soon.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-white rounded-xl shadow">Free</div>
          <div className="p-6 bg-white rounded-xl shadow">Team</div>
          <div className="p-6 bg-white rounded-xl shadow">Enterprise</div>
        </div>
      </div>
    </div>
  );
}
