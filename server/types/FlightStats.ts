export interface FlightStats {
  minHeightBaro?: number;
  maxHeightBaro?: number;
  minHeightGps?: number;
  maxHeightGps?: number;
  maxSink?: number;
  maxClimb?: number;
  maxSpeed?: number;
  taskSpeed?: number;
}
