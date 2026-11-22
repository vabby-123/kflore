"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitContactForm, type EnquiryActionState } from "@/lib/actions/enquiries";

const initialState: EnquiryActionState = { success: false, message: "" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);

  if (state.success) {
    return (
      <div className="border border-gold/50 bg-white p-8 text-center">
        <p className="font-serif-display text-xl text-soft-black">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
          {state.fieldErrors?.name && <p className="text-xs text-burgundy">{state.fieldErrors.name[0]}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" required />
          {state.fieldErrors?.phone && <p className="text-xs text-burgundy">{state.fieldErrors.phone[0]}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email (optional)</Label>
        <Input id="email" name="email" type="email" />
        {state.fieldErrors?.email && <p className="text-xs text-burgundy">{state.fieldErrors.email[0]}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="interestedProduct">Interested Product (optional)</Label>
          <Input id="interestedProduct" name="interestedProduct" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deliveryArea">Delivery Area (optional)</Label>
          <Input id="deliveryArea" name="deliveryArea" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="deliveryDate">Preferred Delivery Date (optional)</Label>
        <Input id="deliveryDate" name="deliveryDate" type="date" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required rows={5} />
        {state.fieldErrors?.message && <p className="text-xs text-burgundy">{state.fieldErrors.message[0]}</p>}
      </div>

      {!state.success && state.message && <p className="text-sm text-burgundy">{state.message}</p>}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "SENDING…" : "SEND MESSAGE"}
      </Button>
    </form>
  );
}
