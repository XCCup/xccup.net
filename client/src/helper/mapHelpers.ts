import type { Flight, Fix } from "@/types/Flight";
import type { Airspace } from "../types/Airspace";
import type L from "leaflet";

export function convertMapBoundsToQueryString(data: L.Polyline): string {
  if (!data) return "";
  let bounds: L.LatLng[] = [];
  // Expand boundary by pad factor
  const pad = 0.4;
  const area = data.getBounds().pad(pad);
  bounds.push(area.getNorthEast());
  bounds.push(area.getNorthWest());
  bounds.push(area.getSouthWest());
  bounds.push(area.getSouthEast());
  return bounds.map((x) => [x.lng, x.lat]).join("|");
}

export function createAirspacePopupContent(airspace: Airspace): string {
  const upperLimitInMeters = tryToConvertToMeters(airspace.ceiling);
  const lowerLimitInMeters = tryToConvertToMeters(airspace.floor);
  return `Name: ${airspace.name}<br>Class: ${airspace.class}<br>Ceiling: ${airspace.ceiling}${upperLimitInMeters}<br>Floor: ${airspace.floor}${lowerLimitInMeters}`;
}

function tryToConvertToMeters(value: string): string {
  const FACTOR_FT_TO_M = 0.3048;

  if (value == "GND") return "";

  if (value.includes("FL")) return "";

  if (value.includes("ft")) {
    const meters = Math.round(parseInt(value.substring(0, 5)) * FACTOR_FT_TO_M);
    return ` / ${meters} m`;
  }

  return "";
}

export interface SimpleFix {
  position: L.LatLngExpression;
  timestamp: number;
}

function createTrackLog(flight: Flight | BuddyTrack): SimpleFix[] | undefined {
  return flight.fixes?.map(({ latitude, longitude, timestamp }) => {
    return {
      position: [latitude, longitude],
      timestamp,
    };
  });
}
interface BuddyTrack {
  buddyFlightId: string;
  buddyName: string;
  fixes: Fix[];
  isActive: boolean;
}

type Tracklog = SimpleFix[];

export function processTracklogs(flight: Flight, buddyTracks: BuddyTrack[]) {
  const tracklogs: Tracklog[] = [];
  tracklogs.push(createTrackLog(flight) ?? []);

  if (buddyTracks) {
    buddyTracks.forEach((buddyTrack) => {
      // Check if this track is activated
      tracklogs.push(
        buddyTrack.isActive ? createTrackLog(buddyTrack) ?? [] : []
      );
    });
  }
  return tracklogs;
}
