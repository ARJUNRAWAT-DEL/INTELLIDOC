import { useEffect, useState } from "react";
import { ApiService } from "../../services/api";

type AnalyticsData = {
  total_documents: number;
  total_size_bytes: number;
  average_size: number;
  most_viewed: Array<{ title: string; views?: number; file_size?: number }>;
  by_file_type: Array<{ file_type: string; count: number }>;
};

const EMPTY: AnalyticsData = {
  total_documents: 0,
  total_size_bytes: 0,
  average_size: 0,
  most_viewed: [],
  by_file_type: [],
};

export default function DocumentAnalytics() {
  const [data, setData] = useState<AnalyticsData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const response = await ApiService.adminGet(
          "/admin/analytics/documents",
        );
        if (mounted) setData({ ...EMPTY, ...response });
      } catch (err: any) {
        if (mounted) setError(err?.message || "Failed to load analytics");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="text-white/70">Loading analytics...</div>;
  if (error) return <div className="text-red-300">{error}</div>;

  return (
    <div className="space-y-6 text-white">
      <h2 className="text-2xl font-bold">Document Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/60">Total Documents</div>
          <div className="mt-2 text-3xl font-black">{data.total_documents}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/60">Total Storage Used</div>
          <div className="mt-2 text-3xl font-black">
            {(data.total_size_bytes / 1024).toFixed(2)} KB
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/60">Average File Size</div>
          <div className="mt-2 text-3xl font-black">
            {(data.average_size / 1024).toFixed(2)} KB
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-semibold">Most Viewed Documents</h3>
          <div className="mt-4 space-y-3">
            {data.most_viewed.length === 0 ? (
              <div className="text-white/60">No documents accessed yet</div>
            ) : (
              data.most_viewed.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3"
                >
                  <div>{item.title}</div>
                  <div className="text-white/60">{item.views ?? 0} views</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-semibold">Documents by Type</h3>
          <div className="mt-4 space-y-3">
            {data.by_file_type.length === 0 ? (
              <div className="text-white/60">No file type data available</div>
            ) : (
              data.by_file_type.map((item) => (
                <div
                  key={item.file_type}
                  className="rounded-xl bg-black/20 px-4 py-3 flex items-center justify-between"
                >
                  <div>{item.file_type}</div>
                  <div className="text-white/60">{item.count}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
