import { auth } from "@/auth";

/** Server Actions are public POST endpoints, so every mutating admin action re-checks the session itself. */
export async function requireStaff() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export async function requireAdmin() {
  const user = await requireStaff();
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  return user;
}