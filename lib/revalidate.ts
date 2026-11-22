import { revalidatePath } from "next/cache";

/** Call after any admin edit that affects public pages (layout data like nav/footer included). */
export function revalidateStorefront() {
  revalidatePath("/", "layout");
}
