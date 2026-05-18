import React from "react";
import { BarChart3, Zap, Clock, Cpu } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, sub }) => (
  <div className="rounded-xl border border-[#1f2937] bg-[#111827] px-5 py-4">
    <div className="flex items-center justify-between mb-2.5">
      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
        {label}
      </span>
      <div className="text-slate-700">{icon}</div>
    </div>
    <p className="text-2xl font-bold text-white tracking-tight leading-none">
      {value}
    </p>
    {sub && <p className="text-[10px] text-slate-600 mt-1.5">{sub}</p>}
  </div>
);

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={<BarChart3 size={16} />}
        label="Indexed"
        value="9"
        sub="documents ready"
      />
      <StatCard
        icon={<Zap size={16} />}
        label="Queries"
        value="142"
        sub="this session"
      />
      <StatCard
        icon={<Clock size={16} />}
        label="Avg Response"
        value="2.1s"
        sub="sub-second for small"
      />
      <StatCard
        icon={<Cpu size={16} />}
        label="Model"
        value="MiniLM"
        sub="384-dim embeddings"
      />
    </div>
  );
};

export default AnalyticsDashboard;
