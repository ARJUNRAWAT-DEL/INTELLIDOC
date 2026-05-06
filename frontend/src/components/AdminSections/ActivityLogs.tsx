import { useEffect, useState } from "react";
import { ApiService } from "../../services/api";

type LogItem = {
  id: number;
  event_type?: string;
  action?: string;
  email?: string;
  user_email?: string;
  target?: string;
  status?: string;
  created_at?: string;
  timestamp?: string;
};

type ViewType = "users" | "documents" | "admin-actions";

export default function ActivityLogs() {
  const [view, setView] = useState<ViewType>("users");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint =
          view === "users"
            ? "/admin/activity-logs/users"
            : view === "documents"
              ? "/admin/activity-logs/documents"
              : "/admin/activity-logs/admin-actions";
        const query =
          status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
        const response = await ApiService.adminGet(`${endpoint}${query}`);
        if (!mounted) return;
        setLogs(response.logs || response.items || response.activities || []);
      } catch (err: any) {
        if (mounted) setError(err?.message || "Failed to load activity logs");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [view, status]);

  return (
    <div className="space-y-6 text-white">
      <div>
        <h2 className="text-2xl font-bold">Activity Logs</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["users", "documents", "admin-actions"] as ViewType[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setView(item)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold ${view === item ? "bg-white text-slate-900 border-white" : "border-white/10 text-white/70 hover:text-white hover:bg-white/5"}`}
          >
            {item === "admin-actions"
              ? "Admin"
              : item === "documents"
                ? "Document"
                : "User"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {["all", "success", "failed"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setStatus(item)}
            className={`rounded-xl border px-3 py-2 ${status === item ? "bg-white text-slate-900 border-white" : "border-white/10 text-white/70 hover:text-white hover:bg-white/5"}`}
          >
            {item}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-white/70">Loading logs...</div>
      ) : error ? (
        <div className="text-red-300">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Email / Target</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    {item.event_type || item.action || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {item.email || item.user_email || item.target || "—"}
                  </td>
                  <td className="px-4 py-3">{item.status || "—"}</td>
                  <td className="px-4 py-3">
                    {item.created_at || item.timestamp
                      ? new Date(
                          item.created_at || item.timestamp || "",
                        ).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-sm text-white/60">
        Showing {logs.length} recent activities
      </div>
    </div>
  );
}
