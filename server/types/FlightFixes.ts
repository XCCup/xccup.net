import { LineString } from "geojson";
import IGCParser from "../helper/igc-parser";

export interface FlightFixesAttributes {
  id: string;
  geom: LineString;
  timeAndHeights: FlightFixTimeAndHeights[];
  stats?: FlightFixStat[];
}

export interface FlightFixStat {
  speed: number;
  climb: number;
}

export interface FlightFixTimeAndHeights {
  timestamp: number;
  time: string;
  pressureAltitude: null | number;
  gpsAltitude: null | number;
  elevation?: number;
}

export interface BRecordElevation extends IGCParser.BRecord {
  elevation?: number;
}

export interface FlightFixCombined extends FlightFixTimeAndHeights {
  longitude: number;
  latitude: number;
  speed?: number;
  climb?: number;
}
