import { useEffect, useState } from "react";
import { ApiService } from "../../services/api";

type RequestItem = {
  id: number;
  name?: string;
  email?: string;
  created_at?: string;
  message?: string;
  company?: string;
};

export default function FeedbackReports() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const response = await ApiService.adminGet(
          "/admin/feedback/demo-requests",
        );
        if (mounted) setRequests(response.requests || response.items || []);
      } catch (err: any) {
        if (mounted) setError(err?.message || "Failed to load feedback");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
    return <div className="text-white/70">Loading feedback reports...</div>;
  if (error) return <div className="text-red-300">{error}</div>;

  return (
    <div className="space-y-6 text-white">
      <h2 className="text-2xl font-bold">Feedback & Reports</h2>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold">
          Demo Requests ({requests.length})
        </h3>
        <div className="mt-4 space-y-3">
          {requests.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">
                    {item.name || "Anonymous"}
                  </div>
                  <div className="text-sm text-white/60">
                    {item.email || "—"}
                  </div>
                </div>
                <div className="text-white/50">
                  {openId === item.id ? "▼" : "▶"}
                </div>
              </div>
              {openId === item.id && (
                <div className="mt-4 space-y-2 text-sm text-white/75">
                  <div>
                    <span className="text-white/50">Date:</span>{" "}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : "—"}
                  </div>
                  <div>
                    <span className="text-white/50">Company:</span>{" "}
                    {item.company || "—"}
                  </div>
                  <div>
                    <span className="text-white/50">Message:</span>{" "}
                    {item.message || "—"}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/60">Total Requests</div>
          <div className="mt-2 text-3xl font-black">{requests.length}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/60">Latest Request</div>
          <div className="mt-2 text-3xl font-black">
            {requests[0]?.created_at
              ? new Date(requests[0].created_at).toLocaleDateString()
              : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
