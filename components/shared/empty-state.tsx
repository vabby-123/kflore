import type { LucideIcon } from "lucide-react";
import { Sprout } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  icon: Icon = Sprout,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-taupe/30 bg-white/60 px-6 py-16 text-center">
      <Icon className="h-8 w-8 text-taupe" />
      <p className="font-serif-display text-lg text-soft-black">{title}</p>
      {description && <p className="max-w-sm text-sm text-taupe">{description}</p>}
      {action}
    </div>
  );
}
