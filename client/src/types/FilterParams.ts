export interface FilterParams {
  clubId?: string;
  endDate?: string;
  flightType?: string;
  gender?: string;
  homeStateOfUser?: string;
  isHikeAndFly?: string;
  isWeekend?: string;
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
