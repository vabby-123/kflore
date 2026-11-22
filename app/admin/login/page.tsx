import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, auth } from "@/auth";
import { Logo } from "@/components/shared/logo";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

async function login(formData: FormData) {
  "use server";
  const callbackUrl = String(formData.get("callbackUrl") || "/admin");
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/admin/login?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw error;
  }
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  if (session?.user) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft-black px-6">
      <div className="w-full max-w-sm flex flex-col gap-8 bg-ivory p-10">
        <div className="flex flex-col items-center gap-2">
          <Logo />
          <span className="text-xs uppercase tracking-label text-taupe">Admin Panel</span>
        </div>

        <form action={login} className="flex flex-col gap-5">
          <input type="hidden" name="callbackUrl" value={sp.callbackUrl || "/admin"} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="username" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          {sp.error && <p className="text-xs text-burgundy">Invalid email or password.</p>}
          <Button type="submit" size="lg">
            SIGN IN
          </Button>
        </form>
      </div>
    </div>
  );
}
