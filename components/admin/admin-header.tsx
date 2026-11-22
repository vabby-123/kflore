import { LogOut } from "lucide-react";
import { signOut } from "@/auth";

export function AdminHeader({ name, role }: { name: string; role: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-taupe/15 bg-white px-6">
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-medium text-soft-black">{name}</span>
        <span className="text-[10px] uppercase tracking-label text-taupe">{role}</span>
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/admin/login" });
        }}
      >
        <button type="submit" className="focus-ring flex items-center gap-1.5 text-xs uppercase tracking-label text-taupe hover:text-burgundy">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </form>
    </header>
  );
}
