export interface ModifiedFlightData {
  externalId: string;
  glider: { id: string };
  report: string;
  airspaceComment: string;
  hikeAndFly: boolean;
  onlyLogbook: boolean;
  photos: string[];
}
