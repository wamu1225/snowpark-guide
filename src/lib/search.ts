import type { Entry } from '../data/types';

export function matchesQuery(query: string, e: Entry): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    e.title.toLowerCase().includes(q) ||
    e.summary.toLowerCase().includes(q) ||
    e.snowparkCode.toLowerCase().includes(q) ||
    e.polarsCode.toLowerCase().includes(q) ||
    e.difference.toLowerCase().includes(q) ||
    e.pitfall.toLowerCase().includes(q)
  );
}
