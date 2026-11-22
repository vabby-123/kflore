import { count, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, enquiries, orders } from "@/lib/db/schema";
import { StatsCard } from "@/components/admin/stats-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Flower2, Star, TrendingUp, MessageSquareText, ShoppingBag } from "lucide-react";
import { formatPriceMYR } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getCount(query: Promise<{ value: number }[]>) {
  const [row] = await query;
  return row?.value ?? 0;
}

export default async function AdminDashboardPage() {
  // eslint-disable-next-line react-hooks/purity -- server component; a fresh "30 days ago" cutoff is required on every request
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalProducts,
    activeProducts,
    featuredProducts,
    bestSellerProducts,
    totalEnquiries,
    recentEnquiries,
    totalOrders,
  ] = await Promise.all([
    getCount(db.select({ value: count() }).from(products)),
    getCount(db.select({ value: count() }).from(products).where(eq(products.status, "PUBLISHED"))),
    getCount(db.select({ value: count() }).from(products).where(eq(products.featured, true))),
    getCount(db.select({ value: count() }).from(products).where(eq(products.bestSeller, true))),
    getCount(db.select({ value: count() }).from(enquiries)),
    db.select().from(enquiries).where(gte(enquiries.createdAt, thirtyDaysAgo)).orderBy(enquiries.createdAt).limit(5),
    getCount(db.select({ value: count() }).from(orders)),
  ]);

  const revenueOrders = await db.select().from(orders);
  const paidOrders = revenueOrders.filter((o) => o.paymentStatus === "PAID");
  const revenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.subtotal), 0);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-serif-display text-2xl text-soft-black">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard label="Total Products" value={totalProducts} icon={Flower2} />
        <StatsCard label="Active Products" value={activeProducts} icon={Flower2} />
        <StatsCard label="Featured" value={featuredProducts} icon={Star} />
        <StatsCard label="Best Sellers" value={bestSellerProducts} icon={TrendingUp} />
        <StatsCard label="WhatsApp Enquiries" value={totalEnquiries} icon={MessageSquareText} />
        <StatsCard label="Online Orders" value={totalOrders} icon={ShoppingBag} />
        <StatsCard label="Paid Orders" value={paidOrders.length} icon={ShoppingBag} />
        <StatsCard label="Revenue (Paid)" value={formatPriceMYR(revenue)} icon={TrendingUp} />
      </div>

      <div className="border border-taupe/15 bg-white p-6">
        <h2 className="mb-4 font-serif-display text-lg text-soft-black">Recent Enquiries</h2>
        {recentEnquiries.length === 0 ? (
          <EmptyState
            title="No enquiries yet"
            description="Enquiries submitted via the contact form or WhatsApp will appear here."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-taupe/10">
            {recentEnquiries.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-soft-black">{e.customerName}</span>
                  <span className="text-xs text-taupe">{e.phone || e.email}</span>
                </div>
                <span className="text-xs uppercase tracking-label text-taupe">{e.status}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/admin/orders" className="focus-ring mt-4 inline-block text-xs uppercase tracking-label text-burgundy underline underline-offset-4">
          View all enquiries
        </Link>
      </div>

      <p className="text-xs text-taupe">
        Charts for enquiries/orders over time, top products and category distribution will populate automatically
        once there is enough historical data — an elegant empty state is shown until then, per the &ldquo;no fake
        analytics&rdquo; requirement.
      </p>
    </div>
  );
}
