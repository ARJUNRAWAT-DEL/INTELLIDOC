import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../services/api";
import StatisticsOverview from "../components/AdminSections/StatisticsOverview";
import UserManagement from "../components/AdminSections/UserManagement";
import DocumentAnalytics from "../components/AdminSections/DocumentAnalytics";
import ActivityLogs from "../components/AdminSections/ActivityLogs";
import SystemHealth from "../components/AdminSections/SystemHealth";
import FeedbackReports from "../components/AdminSections/FeedbackReports";
import AdminSettings from "../components/AdminSections/AdminSettings";

type AdminTab =
  | "overview"
  | "users"
  | "analytics"
  | "activity"
  | "health"
  | "feedback"
  | "settings";

const TABS: Array<{ id: AdminTab; label: string; icon: string }> = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "activity", label: "Activity", icon: "📝" },
  { id: "health", label: "Health", icon: "⚕️" },
  { id: "feedback", label: "Feedback", icon: "💬" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function AdminPortal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        // Get user email from localStorage
        const userRaw = localStorage.getItem("intellidoc_user");
        const user = userRaw ? JSON.parse(userRaw) : null;
        const email = user?.email;

        if (!email) {
          navigate("/login");
          return;
        }

        const currentUser = await ApiService.getCurrentUser(email);
        if (!currentUser?.user?.is_admin) {
          if (alive) setError("Only admins can access this portal");
          navigate("/login");
          return;
        }
      } catch (err: any) {
        const message = String(err?.message || "").toLowerCase();
        if (
          message.includes("admin") ||
          message.includes("unauthorized") ||
          message.includes("token") ||
          message.includes("missing")
        ) {
          navigate("/login");
          return;
        }
        if (alive) setError(err?.message || "Unable to load admin portal");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [navigate]);

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <StatisticsOverview />;
      case "users":
        return <UserManagement />;
      case "analytics":
        return <DocumentAnalytics />;
      case "activity":
        return <ActivityLogs />;
      case "health":
        return <SystemHealth />;
      case "feedback":
        return <FeedbackReports />;
      case "settings":
        return <AdminSettings />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 sm:px-6 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[2rem] border border-white/10 bg-[rgba(7,10,20,0.82)] backdrop-blur-xl shadow-2xl p-8">
            <div className="text-white/70 text-center">
              Loading admin portal...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 sm:px-6 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[2rem] border border-white/10 bg-[rgba(7,10,20,0.82)] backdrop-blur-xl shadow-2xl p-8 text-white/80">
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="mt-3 text-red-300">{error}</p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-6 px-4 py-2 rounded-xl border border-white/10 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              Back home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto relative">
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-[2rem]">
          <div
            className="absolute top-0 right-0 w-[32rem] h-[32rem] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(79,156,255,0.18) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-[28rem] h-[28rem] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(154,77,255,0.18) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[rgba(7,10,20,0.82)] backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="border-b border-white/10 p-6 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/45">
                  Admin Portal
                </p>
                <h1
                  className="mt-2 text-3xl sm:text-4xl font-black text-white"
                  style={{ fontFamily: "Space Grotesk, Inter, system-ui" }}
                >
                  System Management Dashboard
                </h1>
                <p className="mt-2 text-sm text-white/60">
                  Manage users, monitor system health, and view analytics
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-4 py-2 rounded-xl border border-white/10 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Back home
                </button>
                <button
                  type="button"
                  onClick={() => {
                    ApiService.logout();
                    navigate("/login");
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold hover:bg-white/90 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-slate-900 border-white"
                      : "border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8">{renderTab()}</div>
        </div>
      </div>
    </div>
  );
}
