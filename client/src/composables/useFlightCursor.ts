import { computed, readonly, shallowRef, watch } from "vue";
import useAirbuddies from "@/composables/useAirbuddies";
import useFlight from "@/composables/useFlight";
import { findNearestFixIndex } from "@/helper/flightCursorHelpers";
import type { Fix } from "@/types/Flight";

export interface FlightCursorSelection {
  id: string;
  slot: number;
  index: number;
  fix: Readonly<Fix>;
}

export interface FlightCursorSnapshot {
  timestamp: number;
  selections: readonly FlightCursorSelection[];
}

interface FlightCursorTrack {
  id: string;
  slot: number;
  fixes: readonly Fix[];
}

type CursorListener = (snapshot: FlightCursorSnapshot) => void;

const { flight } = useFlight();
const { activeAirbuddyFlights } = useAirbuddies();

const snapshot = shallowRef<FlightCursorSnapshot>();
const mainSelection = shallowRef<FlightCursorSelection>();
const pendingTimestamp = shallowRef<number>();
const listeners = new Set<CursorListener>();
const centerListeners = new Set<() => void>();
let animationFrame: number | undefined;
let cursorTimestamp: number | undefined;

const tracks = computed<FlightCursorTrack[]>(() => {
  if (!flight.value?.fixes?.length) return [];

  const cursorTracks: FlightCursorTrack[] = [
    {
      id: flight.value.id,
      slot: 0,
      fixes: flight.value.fixes,
    },
  ];

  activeAirbuddyFlights.value.forEach((buddy, index) => {
    if (!buddy.isActive || !buddy.fixes?.length) return;
    cursorTracks.push({
      id: buddy.buddyFlightId,
      slot: index + 1,
      fixes: buddy.fixes,
    });
  });

  return cursorTracks;
});

const selectionsAreEqual = (
  previous: readonly FlightCursorSelection[] | undefined,
  next: readonly FlightCursorSelection[]
) =>
  previous?.length === next.length &&
  previous.every(
    (selection, index) =>
      selection.id === next[index].id &&
      selection.slot === next[index].slot &&
      selection.index === next[index].index
  );

function notify(nextSnapshot: FlightCursorSnapshot) {
  listeners.forEach((listener) => listener(nextSnapshot));
}

function commit(timestamp: number, force = false) {
  const currentTracks = tracks.value;
  if (!currentTracks.length) return;

  // The timestamp remains authoritative even if all markers stay on the same
  // fixes. A later Airbuddy activation must use the position currently under
  // the pointer, not the timestamp from the last marker move.
  cursorTimestamp = timestamp;

  const selections = currentTracks.map((track) => {
    const index = findNearestFixIndex(track.fixes, timestamp);
    return {
      id: track.id,
      slot: track.slot,
      index,
      fix: track.fixes[index],
    };
  });

  const nextMainSelection = selections[0];
  const previousMainSelection = mainSelection.value;
  if (
    !previousMainSelection ||
    previousMainSelection.id !== nextMainSelection.id ||
    previousMainSelection.index !== nextMainSelection.index
  ) {
    mainSelection.value = nextMainSelection;
  }

  if (!force && selectionsAreEqual(snapshot.value?.selections, selections))
    return;

  const nextSnapshot = { timestamp, selections };
  snapshot.value = nextSnapshot;
  notify(nextSnapshot);
}

function flushPendingTimestamp() {
  if (animationFrame !== undefined) {
    cancelAnimationFrame(animationFrame);
    animationFrame = undefined;
  }

  const timestamp = pendingTimestamp.value;
  pendingTimestamp.value = undefined;
  if (timestamp !== undefined) commit(timestamp);
}

function syncTracks() {
  const mainTrack = tracks.value[0];
  if (!mainTrack) {
    cursorTimestamp = undefined;
    snapshot.value = undefined;
    mainSelection.value = undefined;
    return;
  }

  const timestamp = cursorTimestamp ?? mainTrack.fixes[0].timestamp;
  commit(timestamp);
}

watch(tracks, syncTracks, { immediate: true });

export default () => {
  const setCursorTimestamp = (timestamp: number, immediately = false) => {
    pendingTimestamp.value = timestamp;
    if (immediately) {
      flushPendingTimestamp();
      return;
    }

    if (animationFrame !== undefined) return;
    animationFrame = requestAnimationFrame(() => {
      animationFrame = undefined;
      flushPendingTimestamp();
    });
  };

  const setMainIndex = (index: number, immediately = false) => {
    const mainTrack = tracks.value[0];
    if (!mainTrack?.fixes.length) return;
    const boundedIndex = Math.min(
      Math.max(index, 0),
      mainTrack.fixes.length - 1
    );
    setCursorTimestamp(mainTrack.fixes[boundedIndex].timestamp, immediately);
  };

  const onCommit = (listener: CursorListener) => {
    listeners.add(listener);
    if (snapshot.value) listener(snapshot.value);
    return () => listeners.delete(listener);
  };

  const onCenter = (listener: () => void) => {
    centerListeners.add(listener);
    return () => centerListeners.delete(listener);
  };

  const requestCenter = () => {
    flushPendingTimestamp();
    centerListeners.forEach((listener) => listener());
  };

  const resetCursor = () => {
    if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
    animationFrame = undefined;
    pendingTimestamp.value = undefined;
    cursorTimestamp = undefined;
    snapshot.value = undefined;
    mainSelection.value = undefined;
  };

  return {
    snapshot: readonly(snapshot),
    mainSelection: readonly(mainSelection),
    setCursorTimestamp,
    setMainIndex,
    onCommit,
    onCenter,
    requestCenter,
    resetCursor,
  };
};
