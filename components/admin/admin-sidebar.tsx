"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Flower2,
  Tags,
  LayersIcon,
  MessageSquareText,
  Home,
  GalleryHorizontal,
  Sparkles,
  Newspaper,
  Mail,
  LayoutTemplate,
  CreditCard,
  Heart,
  Truck,
  Phone,
  Image as ImageIcon,
  Settings,
  Users,
  FileClock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/products", label: "Products", icon: Flower2, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/categories", label: "Categories", icon: Tags, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/collections", label: "Collections", icon: LayersIcon, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/orders", label: "Orders / Enquiries", icon: MessageSquareText, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/payments", label: "Payments", icon: CreditCard, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/storefront", label: "Storefront", icon: LayoutTemplate, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/hero-slides", label: "Hero Slides", icon: GalleryHorizontal, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/signature-picks", label: "Signature Picks", icon: Sparkles, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/journal", label: "Journal", icon: Newspaper, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/homepage", label: "Homepage Story", icon: Home, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/about", label: "About Us", icon: Heart, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/delivery", label: "Delivery", icon: Truck, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/contact", label: "Contact", icon: Phone, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/media", label: "Media", icon: ImageIcon, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
  { href: "/admin/users", label: "Admin Users", icon: Users, roles: ["ADMIN"] },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: FileClock, roles: ["ADMIN"] },
] as const;

export function AdminSidebar({ role }: { role: "ADMIN" | "EDITOR" }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[#1c1c1c] p-5 text-white/80 lg:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <span className="font-serif-display text-xl text-white">KFLORÉ</span>
        <span className="text-[10px] uppercase tracking-label text-white/40">Admin</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV.filter((item) => (item.roles as readonly string[]).includes(role)).map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                active ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
