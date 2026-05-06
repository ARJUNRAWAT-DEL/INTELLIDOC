import { useEffect, useState } from "react";
import { ApiService } from "../../services/api";

type SettingItem = {
  key: string;
  value: string;
  category: string;
  description?: string;
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.adminGet("/admin/settings");
      const items = response.settings || response.items || [];
      setSettings(items);
      const nextDrafts: Record<string, string> = {};
      for (const item of items) nextDrafts[item.key] = item.value;
      setDrafts(nextDrafts);
    } catch (err: any) {
      setError(err?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveSetting = async (key: string) => {
    setSavingKey(key);
    try {
      await ApiService.adminPost("/admin/settings", {
        key,
        value: drafts[key],
      });
      await loadSettings();
    } catch (err: any) {
      alert(err?.message || "Failed to save setting");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) return <div className="text-white/70">Loading settings...</div>;
  if (error) return <div className="text-red-300">{error}</div>;

  const categories = Array.from(
    new Set(settings.map((item) => item.category || "general")),
  );

  return (
    <div className="space-y-6 text-white">
      <h2 className="text-2xl font-bold">System Settings</h2>

      {settings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/60">
          No settings configured yet
        </div>
      ) : (
        categories.map((category) => (
          <div
            key={category}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4"
          >
            <h3 className="text-lg font-semibold capitalize">{category}</h3>
            {settings
              .filter((item) => (item.category || "general") === category)
              .map((item) => (
                <div
                  key={item.key}
                  className="rounded-xl bg-black/20 p-4 space-y-3"
                >
                  <div>
                    <div className="font-semibold">{item.key}</div>
                    {item.description ? (
                      <div className="text-sm text-white/60 mt-1">
                        {item.description}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                      value={drafts[item.key] ?? ""}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [item.key]: e.target.value,
                        }))
                      }
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => saveSetting(item.key)}
                      disabled={savingKey === item.key}
                      className="rounded-xl bg-white px-4 py-3 font-semibold text-slate-900 disabled:opacity-50"
                    >
                      {savingKey === item.key ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
        <div className="font-semibold text-white">System Settings</div>
        <div className="mt-2">
          These are your system-wide settings. Changes take effect immediately.
          Ensure you understand the impact of each setting before modifying.
        </div>
      </div>
    </div>
  );
}
