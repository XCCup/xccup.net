import type { FlightType } from "./FlightType";

export interface FilterParams {
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
  site?: string;
  siteId?: string;
  siteRegion?: string;
  startDate?: string;
  teamId?: string;
  userId?: string;
  userIds?: string[];
  year?: number;
  sortOder: "desc" | "asc";
}
