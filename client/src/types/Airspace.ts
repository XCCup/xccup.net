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
