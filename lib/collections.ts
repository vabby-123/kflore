/** Built-in collection groupings. `type` is free text in the DB, so admins may add their own. */
export const COLLECTION_TYPES = [
  { value: "OCCASION", label: "By Occasion" },
  { value: "TYPE", label: "By Type" },
  { value: "STYLE", label: "By Style / Mood" },
  { value: "FLOWER", label: "By Flower" },
] as const;

export function collectionTypeLabel(type: string): string {
  return COLLECTION_TYPES.find((t) => t.value === type)?.label ?? type;
}

export interface NavCollection {
  name: string;
  slug: string;
  type: string;
}

/** Group collections by type: built-in types first (in fixed order), custom types after. */
export function groupCollectionsByType<T extends NavCollection>(list: T[]): { type: string; label: string; items: T[] }[] {
  const map = new Map<string, T[]>();
  for (const c of list) map.set(c.type, [...(map.get(c.type) ?? []), c]);
  const builtIn = COLLECTION_TYPES.map((t) => t.value as string);
  const ordered = [...builtIn.filter((t) => map.has(t)), ...[...map.keys()].filter((t) => !builtIn.includes(t))];
  return ordered.map((type) => ({ type, label: collectionTypeLabel(type), items: map.get(type)! }));
}
