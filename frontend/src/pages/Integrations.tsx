export default function Integrations() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold">Integrations</h1>
        <p className="mt-3 text-gray-600">Connect IntelliDoc to Slack, Google Drive, Microsoft 365, and more.</p>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg shadow">Google Drive</div>
          <div className="p-4 bg-white rounded-lg shadow">Slack</div>
          <div className="p-4 bg-white rounded-lg shadow">Microsoft 365</div>
          <div className="p-4 bg-white rounded-lg shadow">Custom API</div>
        </div>
      </div>
    </div>
  );
}
