export function isCacheValid(fetchedAt: Date, ttlHours: number): boolean {
  const ttlMs = ttlHours * 60 * 60 * 1000;
  return Date.now() - fetchedAt.getTime() <= ttlMs;
}
