import L from "leaflet";
import { GestureHandling } from "leaflet-gesture-handling";

let isGestureHandlingRegistered = false;

/** Registers the Leaflet extension once for the lifetime of the application. */
export function registerLeafletGestureHandling() {
  if (isGestureHandlingRegistered) return;

  L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);
  isGestureHandlingRegistered = true;
}
