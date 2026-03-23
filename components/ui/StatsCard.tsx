interface StatsCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  sub?: string;
}

export function StatsCard({ label, value, icon, color = "bg-delabie-blue-pale text-delabie-blue", sub }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-delabie-text">{value}</p>
        <p className="text-sm text-delabie-gray-dark">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
