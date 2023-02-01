import type { FlightType } from "./FlightType";

export interface FlightsFilterParams {
  clubId?: string;
  endDate?: string;
  flightType?: FlightType;
  limit?: number;
  offset?: number;
  rankingClass?: string;
  site?: string;
  siteId?: string;
  startDate?: string;
  teamId?: string;
  userId?: string;
  year?: number;
  sortOder: "desc" | "asc";
}

export interface OverallFilterParams {
  clubId?: string;
  endDate?: string;
  flightType?: FlightType;
  gender?: string;
  homeStateOfUser?: string;
  isHikeAndFly?: boolean;
  isWeekend?: boolean;
  limit?: number;
  offset?: number;
  rankingClass?: string;
  siteShortName?: string;
  clubShortName?: string;
  site?: string;
  siteId?: string;
  siteRegion?: string;
  startDate?: string;
  year?: number;
  sortOder: "desc" | "asc";
}

export interface OverallLadiesFilterParams
  extends Omit<OverallFilterParams, "gender"> {}

export interface UserFilterParams {
  records: boolean;
  clubId?: string;
  limit?: number;
  offset?: number;
  teamId?: string;
  userIds?: string[];
}

export interface ClubsFilterParams {
  limit?: number;
  year?: number;
}

export interface ResultsTeamsFilterParams {
  year?: number;
  siteRegion?: string;
}

export interface TeamsFilterParams {
  limit?: number;
  includeStats?: boolean;
}

export interface SeniorsFilterParams {
  limit?: number;
  year?: number;
  siteRegion?: string;
}
export interface ReynoldsClassFilterParams {
  limit?: number;
  year?: number;
  siteRegion?: string;
}

export interface NewcomerFilterParams {
  limit?: number;
  year?: number;
  siteRegion?: string;
}

export interface NewcomerFilterParams {
  limit?: number;
  year?: number;
  siteRegion?: string;
}

export interface RlpFilterParams {
  limit?: number;
  year?: number;
}

export interface LuxFilterParams {
  limit?: number;
  year?: number;
}

export interface ResultsLateBirdFilterParams {
  siteRegion?: string;
  year?: number;
}

export interface ResultsEarlyBirdFilterParams {
  siteRegion?: string;
  year?: number;
}
