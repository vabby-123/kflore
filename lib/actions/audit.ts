import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { auth } from "@/auth";

export async function logAudit(action: string, entity: string, entityId?: string, details?: string) {
  try {
    const session = await auth();
    await db.insert(auditLogs).values({
      userId: session?.user?.id,
      action,
      entity,
      entityId,
      details,
    });
  } catch (err) {
    console.error("[audit] failed to write audit log", err);
  }
}
