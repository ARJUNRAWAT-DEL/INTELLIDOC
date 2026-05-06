import { useEffect, useState } from "react";
import { ApiService } from "../../services/api";

type OverviewData = {
  users: number;
  documents: number;
  demo_requests: number;
  onboarding_completed: number;
  recent_logins_24h: number;
  documents_uploaded_7d: number;
  system_errors_24h: number;
  admin_actions_today: number;
};

const EMPTY: OverviewData = {
  users: 0,
  documents: 0,
  demo_requests: 0,
  onboarding_completed: 0,
  recent_logins_24h: 0,
  documents_uploaded_7d: 0,
  system_errors_24h: 0,
  admin_actions_today: 0,
};

const cards = [
  { key: "users", label: "Total Users", icon: "👥" },
  { key: "documents", label: "Documents", icon: "📄" },
  { key: "demo_requests", label: "Demo Requests", icon: "📧" },
  { key: "onboarding_completed", label: "Completed Onboarding", icon: "✅" },
  { key: "recent_logins_24h", label: "Logins (24h)", icon: "📍" },
  { key: "documents_uploaded_7d", label: "Uploads (7d)", icon: "⬆️" },
  { key: "system_errors_24h", label: "System Errors (24h)", icon: "⚠️" },
  { key: "admin_actions_today", label: "Admin Actions Today", icon: "⚙️" },
] as const;

export default function StatisticsOverview() {
  const [data, setData] = useState<OverviewData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const response = await ApiService.adminGet(
          "/admin/statistics/overview",
        );
        if (mounted) setData({ ...EMPTY, ...response });
      } catch (err: any) {
        if (mounted) setError(err?.message || "Failed to load overview");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="text-white/70">Loading overview...</div>;
  if (error) return <div className="text-red-300">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">System Overview</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.key}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-2xl mb-2">{card.icon}</div>
                <div className="text-sm text-white/60">{card.label}</div>
              </div>
              <div className="text-3xl font-black">
                {(data as any)[card.key]}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white">
        <h3 className="text-lg font-semibold">Quick Insights</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-white/70">
          <div className="rounded-xl bg-black/20 p-4">
            <div className="text-white">User Growth</div>
            <div className="mt-1">{data.users} registered users</div>
          </div>
          <div className="rounded-xl bg-black/20 p-4">
            <div className="text-white">Activity</div>
            <div className="mt-1">{data.recent_logins_24h} logins today</div>
          </div>
          <div className="rounded-xl bg-black/20 p-4">
            <div className="text-white">Content</div>
            <div className="mt-1">
              {data.documents_uploaded_7d} uploads this week
            </div>
          </div>
          <div className="rounded-xl bg-black/20 p-4">
            <div className="text-white">System Health</div>
            <div className="mt-1">
              {data.system_errors_24h === 0
                ? "✓ Healthy"
                : `${data.system_errors_24h} errors reported`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
