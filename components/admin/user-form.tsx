"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { FormActionState } from "@/lib/actions/categories";

export function UserForm({
  action,
  initial,
}: {
  action: (state: FormActionState, formData: FormData) => Promise<FormActionState>;
  initial?: { name: string; email: string; role: string };
}) {
  const [state, formAction, pending] = useActionState(action, { success: false });
  if (state.success && state.message) toast.success(state.message);

  return (
    <form action={formAction} className="flex flex-col gap-4 border border-taupe/15 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required defaultValue={initial?.name} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required defaultValue={initial?.email} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role">Role</Label>
          <select id="role" name="role" defaultValue={initial?.role ?? "EDITOR"} className="focus-ring h-11 border border-taupe/40 bg-white px-3 text-sm">
            <option value="EDITOR">Editor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{initial ? "New Password (optional)" : "Password"}</Label>
          <Input id="password" name="password" type="password" required={!initial} minLength={8} />
        </div>
      </div>
      {state.fieldErrors && (
        <p className="text-xs text-burgundy">{Object.values(state.fieldErrors).flat()[0]}</p>
      )}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "SAVING…" : initial ? "UPDATE USER" : "CREATE USER"}
      </Button>
    </form>
  );
}
