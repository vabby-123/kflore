import { db } from "./index";
import { collections } from "./schema";

/** Distinct collection types already in use, so custom ones can be re-suggested in the admin form. */
export async function getCustomCollectionTypes() {
  const rows = await db.selectDistinct({ type: collections.type }).from(collections);
  return rows.map((r) => r.type);
}