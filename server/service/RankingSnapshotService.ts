import db from "../db";
import logger from "../config/logger";

const { Result } = db;

// Reuses the existing "Result" model (season/type/result-JSON), which is
// otherwise only used to freeze the results of finished seasons. Here it
// stores the *current* season's ranking-change bookkeeping instead.
const RANKING_SNAPSHOT_TYPE = "overallSnapshot";

export interface RankingSnapshotEntry {
  userId: string;
  // The rank/points as of this user's own last flight-related event
  // (upload, edit, delete, accepted/rejected violation). Only ever moves
  // when THIS user is the one who caused the recompute - never touched by
  // someone else's flight. This is what "lastGain"/"lastRankChange" below
  // are measured against, which is what makes them persist across any
  // number of unrelated changes elsewhere until this user acts again.
  referenceRank: number;
  referencePoints: number;
  // The rank as of the last time this entry was written at all (by this
  // user's own event OR a passive push from someone else). Used only to
  // detect "did anything change since we last looked" - kept separate from
  // referenceRank because that one must NOT move on a passive push, while
  // this one always reflects the true current rank at last write time.
  lastKnownRank: number;
  // What to display. Frozen at the moment they were last (re)computed -
  // NOT re-derived live on every read - so a value keeps showing exactly as
  // computed until the next event that's relevant to this user.
  lastGain: number;
  lastRankChange: number;
  // Whether lastGain/lastRankChange currently reflect this user's own flight
  // event (true) or a passive push by someone else (false). Used to decide
  // whether to highlight their latest submitted flight in the UI - that
  // highlight should only show when they themselves caused the tendenz.
  causedByOwnEvent: boolean;
  // When lastGain/lastRankChange were last (re)computed. It's a "weekly
  // trend": even completely untouched (see the "skip" case above), a value
  // stops being shown once it's older than MAX_TENDENZ_AGE_MS - a pilot who
  // hasn't flown in a while shouldn't keep showing an old badge forever.
  lastUpdatedAt: string;
}

const MAX_TENDENZ_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function isExpired(entry: RankingSnapshotEntry) {
  return Date.now() - new Date(entry.lastUpdatedAt).getTime() > MAX_TENDENZ_AGE_MS;
}

interface ResultLike {
  user: { id: string };
  totalPoints: number;
}

/**
 * Diffs the freshly computed overall-ranking results against the previously
 * stored snapshot and persists the new one.
 *
 * Must be called exactly once per actual change to the ranking (e.g. from
 * FlightController after a flight was added, edited or removed), passing the
 * id of the user whose flight caused it - NOT on every read of the ranking.
 *
 * Semantics (see the strategy discussion for the full reasoning):
 * - For the user whose own flight changed: lastGain/lastRankChange reflect
 *   the outcome of that specific change (vs. their state as of their own
 *   previous event), and their reference moves to the current state - so a
 *   next own event starts measuring fresh from here.
 *     - Better placement -> positive rankChange (+ gain if points went up).
 *     - Flight not good enough to enter their own top N -> both reset to 0
 *       ("-", no badge).
 *     - Flight improves points but not placement -> rankChange 0 ("-"),
 *       gain shown.
 * - For every other user: their reference is left untouched. If their rank
 *   moved as a side effect (someone overtook/was overtaken), rankChange is
 *   recomputed against that same untouched reference, so it accumulates
 *   correctly across several unrelated events. lastGain is left as-is - it's
 *   only ever set by that user's own events. If their rank didn't move at
 *   all, they're skipped entirely - whatever was shown keeps showing.
 *
 * Scope: only the default (unfiltered, current season) overall ranking. The
 * many filter combinations of getOverall (class, gender, club, ...) are out
 * of scope for now, see the strategy discussion.
 */
async function updateSnapshot(
  freshResultsSortedDescending: ResultLike[],
  season: number,
  affectedUserId: string
) {
  const existing = await Result.findOne({
    where: { season, type: RANKING_SNAPSHOT_TYPE },
  });
  const oldEntries = (existing?.result as RankingSnapshotEntry[]) ?? [];
  const oldByUserId = new Map(oldEntries.map((entry) => [entry.userId, entry]));

  const newEntries: RankingSnapshotEntry[] = freshResultsSortedDescending.map(
    (result, index) => {
      const userId = result.user.id;
      const currentRank = index + 1;
      const currentPoints = result.totalPoints;
      const old = oldByUserId.get(userId);
      const now = new Date().toISOString();

      // Never seen before - just establish a baseline, nothing to show yet.
      if (!old) {
        return {
          userId,
          referenceRank: currentRank,
          referencePoints: currentPoints,
          lastKnownRank: currentRank,
          lastGain: 0,
          lastRankChange: 0,
          causedByOwnEvent: false,
          lastUpdatedAt: now,
        };
      }

      if (userId === affectedUserId) {
        // Points can't meaningfully decrease from this, but could in rare
        // edge cases (e.g. a flight gets disqualified afterwards). Clamp to
        // 0 rather than showing a confusing negative "gain".
        const lastGain = Math.max(0, currentPoints - old.referencePoints);
        const lastRankChange = old.referenceRank - currentRank;
        return {
          userId,
          referenceRank: currentRank,
          referencePoints: currentPoints,
          lastKnownRank: currentRank,
          lastGain,
          lastRankChange,
          causedByOwnEvent: true,
          lastUpdatedAt: now,
        };
      }

      // Not their event - did their rank move as a side effect (someone
      // else overtook them or fell behind them)?
      if (currentRank === old.lastKnownRank) {
        // No effect on them - leave completely untouched (including the
        // timestamp - a passive non-event shouldn't refresh the 7-day clock).
        return old;
      }

      return {
        ...old,
        lastKnownRank: currentRank,
        lastRankChange: old.referenceRank - currentRank,
        causedByOwnEvent: false,
        lastUpdatedAt: now,
      };
    }
  );

  if (existing) {
    existing.result = newEntries;
    await existing.save();
  } else {
    await Result.create({
      season,
      type: RANKING_SNAPSHOT_TYPE,
      result: newEntries,
    });
  }

  logger.debug(
    `RSS: Updated overall ranking snapshot for season ${season} (${newEntries.length} entries)`
  );
}

/**
 * Returns the last-known "point gain" / "rank change" per user, to be
 * attached to the live-computed results when read.
 */
async function getChanges(season: number) {
  const existing = await Result.findOne({
    where: { season, type: RANKING_SNAPSHOT_TYPE },
  });
  const entries = (existing?.result as RankingSnapshotEntry[]) ?? [];

  return new Map(
    entries.map((entry) => [
      entry.userId,
      isExpired(entry)
        ? { lastGain: 0, lastRankChange: 0, causedByOwnEvent: false }
        : {
            lastGain: entry.lastGain,
            lastRankChange: entry.lastRankChange,
            causedByOwnEvent: entry.causedByOwnEvent,
          },
    ])
  );
}

const service = {
  updateSnapshot,
  getChanges,
};

export default service;
