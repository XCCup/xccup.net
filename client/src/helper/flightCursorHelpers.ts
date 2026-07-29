import type { Fix } from "@/types/Flight";

/**
 * Finds the fix closest to a timestamp in a sorted track. Ties intentionally
 * select the earlier fix so the cursor never jumps ahead of the chart time.
 */
export function findNearestFixIndex(
  fixes: readonly Pick<Fix, "timestamp">[],
  timestamp: number
): number {
  if (!fixes.length) return -1;
  if (timestamp <= fixes[0].timestamp) return 0;

  const lastIndex = fixes.length - 1;
  if (timestamp >= fixes[lastIndex].timestamp) return lastIndex;

  let low = 0;
  let high = lastIndex;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (fixes[middle].timestamp < timestamp) low = middle + 1;
    else high = middle;
  }

  const laterIndex = low;
  const earlierIndex = laterIndex - 1;
  return timestamp - fixes[earlierIndex].timestamp <=
    fixes[laterIndex].timestamp - timestamp
    ? earlierIndex
    : laterIndex;
}
