import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How KFLORÉ collects, uses and protects your personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="container-kflore page-section flex flex-col gap-8">
      <SectionHeading eyebrow="LEGAL" title="Privacy Policy" align="left" />
      <div className="prose-content flex max-w-3xl flex-col gap-5 text-sm leading-relaxed text-taupe">
        <p className="text-soft-black">
          <strong>Placeholder content.</strong> This page must be reviewed and finalised by KFLORÉ&rsquo;s management
          (and ideally legal counsel) before launch. It is provided as a structural starting point only.
        </p>
        <p>
          KFLORÉ (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects personal information you provide when placing an
          enquiry or order, including your name, phone number, email address and delivery details. This information
          is used solely to process your order, communicate with you about your enquiry, and improve our service.
        </p>
        <p>
          We do not sell your personal information to third parties. Information may be shared with delivery
          partners strictly for the purpose of fulfilling your order.
        </p>
        <p>
          You may contact us at any time to request access to, correction of, or deletion of your personal
          information via the details on our Contact page.
        </p>
      </div>
    </div>
  );
}

