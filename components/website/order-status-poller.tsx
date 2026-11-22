"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Polls /api/orders/[id]/status while Billplz's webhook is still in flight, then refreshes the
 * server-rendered confirmation page once the order moves out of PENDING (or gives up after ~45s).
 */
export function OrderStatusPoller({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const maxAttempts = 18;

  useEffect(() => {
    if (attempt >= maxAttempts) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.paymentStatus !== "PENDING") {
            router.refresh();
            return;
          }
        }
      } catch {
        // transient — just try again
      }
      setAttempt((a) => a + 1);
    }, 2500);
    return () => clearTimeout(timer);
  }, [attempt, orderId, router]);

  if (attempt >= maxAttempts) {
    return (
      <p className="text-sm text-taupe">
        This is taking longer than expected. Your payment may still be processing — please check your email, or
        message us on WhatsApp with your order number if you&rsquo;re unsure.
      </p>
    );
  }

  return <p className="text-sm text-taupe">Confirming your payment with the bank… this usually takes a few seconds.</p>;
}
