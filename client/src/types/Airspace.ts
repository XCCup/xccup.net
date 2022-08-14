import type { Polygon } from "geojson";

export interface Airspace {
  id: string;
  season: number;
  class: string;
  name: string;
  floor: string;
  ceiling: string;
  polygon: Polygon;
  createdAt: string;
  updatedAt: string;
}

export interface AirspaceViolation {
  lat: number;
  long: number;
  gpsAltitude: number;
  pressureAltitude: number;
  lowerLimitMeter: number;
  upperLimitMeter: number;
  lowerLimitOriginal: string;
  upperLimitOrignal: string;
  airspaceName: string;
  timestamp: number;
}
