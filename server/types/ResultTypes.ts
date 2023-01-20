import { FlightInstance, FlightInstanceUserInclude } from "../db/models/Flight";
import { FlyingSiteInstance } from "../db/models/FlyingSite";

export interface TeamBaseAttributes {
  name: string;
  id: string;
}

export interface Team extends TeamBaseAttributes {
  season: number;
  members: [
    {
      fullname: string;
      firstName: string;
      lastName: string;
      id: string;
    }
  ];
}

export interface TeamWithMemberFlights extends Omit<Team, "members"> {
  members: Member[];
}

export interface TeamResults extends TeamWithMemberFlights, Totals {}

export interface Member extends Totals {
  firstName: string;
  lastName: string;
  id: string;
  flights: UserResultFlight[];
}

export interface ClubResults extends Totals {
  clubName: string;
  clubId: string;
  members: Member[];
}

export interface UserResults {
  user: User;
  club: Club;
  team: TeamBaseAttributes;
  flights: UserResultFlight[];
}

export interface UserResultsWithTotals extends UserResults, Totals {
  totalFlights: number;
}

export interface Totals {
  totalPoints: number;
  totalDistance: number;
}

export interface UserResultFlight {
  isDismissed?: boolean;
  id: string;
  externalId: number;
  flightPoints: number;
  flightDistance: number;
  glider: {
    id: string;
    brand: string;
    model: string;
    gliderClass: {
      key: string;
      shortDescription: string;
    };
  };
  flightType: string;
  takeoffName: string;
  takeoffShortName: string;
  takeoffRegion: string;
  takeoffId: string;
  ageOfUser: number;
}

export interface QueryResult extends UserResultFlight {
  user: User & { birthday: string };
  takeoff: Takeoff;
  club: Club;
  team: TeamBaseAttributes;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
}

interface Club {
  name: string;
  id: string;
}

interface Takeoff {
  name: string;
  shortName: string;
  id: string;
  region: string;
}

export interface SiteRecordsUncombined {
  free: FlightSitesWithRecord[];
  flat: FlightSitesWithRecord[];
  fai: FlightSitesWithRecord[];
}

export interface FlightSitesWithRecord extends FlyingSiteInstance {
  flights: FlightSiteRecord[];
}

export interface FlightSiteRecord {
  id: string;
  externalId: number;
  flightPoints: number;
  flightDistance: number;
  userId: string;
  takeoffTime: Date;
  glider: object;
  user: {
    firstName: string;
    lastName: string;
    fullName: string;
    id: string;
  };
}

export interface SiteRecord {
  takeoff: Omit<Takeoff, "region">;
  free?: TypeRecord;
  flat?: TypeRecord;
  fai?: TypeRecord;
}

export interface TypeRecord {
  user: {
    firstName?: string;
    lastName?: string;
    id?: string;
  };
  flightId: string;
  externalId: number;
  takeoffTime: Date;
  points: number;
  distance: number;
  glider: {
    brand: string;
    model: string;
    gliderClass: {
      key: string;
      shortDescription: string;
    };
  };
}
