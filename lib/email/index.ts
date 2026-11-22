const RESEND_API_KEY = process.env.RESEND_API_KEY;
const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL;

/**
 * Sends a transactional notification email via Resend when RESEND_API_KEY is
 * configured. Silently no-ops otherwise (the enquiry is still saved to the
 * database and visible in /admin) so local development never fails on a
 * missing third-party key.
 */
export async function sendEnquiryNotification(params: {
  customerName: string;
  phone?: string;
  email?: string;
  message?: string;
  interestedProduct?: string;
}) {
  if (!RESEND_API_KEY || !BUSINESS_EMAIL) {
    console.info("[email] RESEND_API_KEY / BUSINESS_EMAIL not configured — skipping notification email.");
    return { skipped: true };
  }

  const html = `
    <h2>New KFLORÉ enquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(params.customerName)}</p>
    ${params.phone ? `<p><strong>Phone:</strong> ${escapeHtml(params.phone)}</p>` : ""}
    ${params.email ? `<p><strong>Email:</strong> ${escapeHtml(params.email)}</p>` : ""}
    ${params.interestedProduct ? `<p><strong>Interested product:</strong> ${escapeHtml(params.interestedProduct)}</p>` : ""}
    ${params.message ? `<p><strong>Message:</strong><br/>${escapeHtml(params.message)}</p>` : ""}
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "KFLORÉ Website <onboarding@resend.dev>",
      to: [BUSINESS_EMAIL],
      subject: `New enquiry from ${params.customerName}`,
      html,
    }),
  });

  if (!res.ok) {
    console.error("[email] Failed to send notification:", await res.text());
    return { skipped: false, ok: false };
  }
  return { skipped: false, ok: true };
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
