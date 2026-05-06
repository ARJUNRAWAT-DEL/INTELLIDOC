import { useEffect, useState } from "react";
import { ApiService } from "../../services/api";

type Metrics = {
  users: number;
  documents: number;
  chunks: number;
  conversations: number;
  db_tables: number;
  system_status?: string;
};

type ErrorItem = {
  id: number;
  severity?: string;
  error_message?: string;
  endpoint?: string;
  created_at?: string;
};

export default function SystemHealth() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [metricsResponse, errorsResponse] = await Promise.all([
          ApiService.adminGet("/admin/system-health/metrics"),
          ApiService.adminGet(
            `/admin/system-health/errors${severity !== "all" ? `?severity=${encodeURIComponent(severity)}` : ""}`,
          ),
        ]);
        if (!mounted) return;
        setMetrics(metricsResponse);
        setErrors(errorsResponse.errors || errorsResponse.logs || []);
      } catch (err: any) {
        if (mounted) setError(err?.message || "Failed to load system health");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [severity]);

  if (loading)
    return <div className="text-white/70">Loading system health...</div>;
  if (error) return <div className="text-red-300">{error}</div>;

  const healthy =
    (metrics?.system_status || "healthy").toLowerCase().includes("healthy") &&
    errors.length === 0;

  return (
    <div className="space-y-6 text-white">
      <h2 className="text-2xl font-bold">System Health</h2>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-center justify-between">
        <div>
          <div className="text-sm text-white/60">System Status</div>
          <div className="mt-2 text-3xl font-black">
            {healthy ? "Healthy" : "Needs Attention"}
          </div>
        </div>
        <div
          className={`text-4xl ${healthy ? "text-emerald-300" : "text-amber-300"}`}
        >
          {healthy ? "✓" : "!"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          ["Users", metrics?.users ?? 0],
          ["Documents", metrics?.documents ?? 0],
          ["Chunks", metrics?.chunks ?? 0],
          ["Conversations", metrics?.conversations ?? 0],
          ["DB Tables", metrics?.db_tables ?? 0],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <div className="text-sm text-white/60">{label}</div>
            <div className="mt-2 text-3xl font-black">{String(value)}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap gap-2">
          {["all", "critical", "error", "warning"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSeverity(item)}
              className={`rounded-xl border px-3 py-2 text-sm ${severity === item ? "bg-white text-slate-900 border-white" : "border-white/10 text-white/70 hover:text-white hover:bg-white/5"}`}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {errors.length === 0 ? (
            <div className="text-white/60">No errors found</div>
          ) : (
            errors.map((item) => (
              <div key={item.id} className="rounded-xl bg-black/20 px-4 py-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="font-semibold">
                    {item.severity || "error"}
                  </div>
                  <div className="text-white/50">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : "—"}
                  </div>
                </div>
                <div className="mt-2 text-white/80">
                  {item.error_message || "Unknown error"}
                </div>
                <div className="mt-1 text-white/50 text-sm">
                  {item.endpoint || "—"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
