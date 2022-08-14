import type { Flight } from "@/types/Flight";
import type { BuddyTrack } from "@/types/BuddyTrack";
import type { Airspace, AirspaceViolation } from "../types/Airspace";
import L from "leaflet";
import ApiService from "@/services/ApiService";

export function convertMapBoundsToQueryString(data: L.Polyline): string {
  if (!data) return "";
  const bounds: L.LatLng[] = [];
  // Expand boundary by pad factor
  const pad = 0.4;
  const area = data.getBounds().pad(pad);
  bounds.push(area.getNorthEast());
  bounds.push(area.getNorthWest());
  bounds.push(area.getSouthWest());
  bounds.push(area.getSouthEast());
  return bounds.map((x) => [x.lng.toFixed(3), x.lat.toFixed(3)]).join("|");
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

export async function drawAirspaces(map: L.Map, bounds: string) {
  try {
    const res = await ApiService.getAirspaces(bounds);
    const airspaceData = res.data;
    const options: L.GeoJSONOptions = {
      // @ts-expect-error
      opacity: 0.1,
      fillOpacity: 0.08,
      color: "red",
    };
    airspaceData.forEach((airspace: Airspace) => {
      L.geoJSON(airspace.polygon, options)
        .bindPopup(createAirspacePopupContent(airspace))
        .addTo(map);
    });
  } catch (error) {
    console.log(error);
  }
}

export function drawViolations(map: L.Map, violations: AirspaceViolation[]) {
  if (!violations || !violations.length) return;
  violations.forEach((violation: any) => {
    L.marker([violation.lat, violation.long], {
      riseOnHover: true,
    })
      .bindPopup(createViolationPopupContent(violation))
      .addTo(map);
  });
}

function createViolationPopupContent(violation: AirspaceViolation) {
  return `GPS Höhe:  ${violation.gpsAltitude} m
  <br>ISA Höhe:  ${violation.pressureAltitude} m
  <br>Untergrenze:  ${Math.round(violation.lowerLimit)} m
  <br>Obergrenze:  ${Math.round(violation.upperLimit)} m`;
}
