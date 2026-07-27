export interface SeasonDetail {
  id?: number;
  year: number;
  startDate: string;
  endDate: string;
  isPaused: boolean;
  pointThresholdForFlight: number;
  numberOfFlightsForShirt: number;
  gliderClasses: object;
  flightTypeFactors: {
    FAI: number;
    FREE: number;
    FLAT: number;
  };
  rankingClasses: object;
  seniorStartAge: number;
  seniorBonusPerAge: number;
  activeRankings: object;
  misc: object;
  createdAt?: string;
  updatedAt?: string;
}
