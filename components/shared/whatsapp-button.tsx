"use client";

import { MessageCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps extends Omit<ButtonProps, "onClick"> {
  phoneNumber: string;
  message: string;
  label?: string;
  showIcon?: boolean;
}

export function WhatsAppButton({
  phoneNumber,
  message,
  label = "ORDER VIA WHATSAPP",
  showIcon = true,
  variant = "whatsapp",
  className,
  ...props
}: WhatsAppButtonProps) {
  const href = buildWhatsAppUrl(phoneNumber, message);
  return (
    <Button asChild variant={variant} className={cn(className)} {...props}>
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
        {showIcon && <MessageCircle className="h-4 w-4" aria-hidden="true" />}
        {label}
      </a>
    </Button>
  );
}
