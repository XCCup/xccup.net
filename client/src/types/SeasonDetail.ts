export interface SeasonDetail {
  id?: number;
  year: number;
  startDate: string;
  endDate: string;
  isPaused: boolean;
  pointThresholdForFlight: number;
  numberOfFlightsForShirt: number;
  gliderClasses: Object;
  flightTypeFactors: {
    FAI: number;
    FREE: number;
    FLAT: number;
  };
  rankingClasses: Object;
  seniorStartAge: number;
  seniorBonusPerAge: number;
  activeRankings: Object;
  misc: Object;
  createdAt?: string;
  updatedAt?: string;
}
