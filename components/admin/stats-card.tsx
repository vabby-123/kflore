import type { LucideIcon } from "lucide-react";

export function StatsCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-4 border border-taupe/15 bg-white p-5">
      <div className="flex h-11 w-11 items-center justify-center bg-burgundy/10 text-burgundy">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-semibold text-soft-black">{value}</span>
        <span className="text-xs uppercase tracking-label text-taupe">{label}</span>
      </div>
    </div>
  );
}
