import type { Glider } from "./Glider";
import type { UserData } from "./UserData";
import type { Comment } from "./Comment";

export interface Flight {
  id: string;
  externalId: number;
  landing: string;
  report: string;
  airspaceComment: null;
  flightPoints: number;
  flightDistance: number;
  flightDistanceFree: null;
  flightDistanceFlat: null;
  flightDistanceFAI: null;
  flightType: string;
  flightStatus: string;
  flightTurnpoints: FlightTurnpoint[];
  airtime: number;
  takeoffTime: string;
  landingTime: string;
  igcPath: string;
  glider: Glider;
  airspaceViolation: boolean;
  uncheckedGRecord: boolean;
  violationAccepted: boolean;
  hikeAndFly: number;
  isWeekend: boolean;
  region: null;
  ageOfUser: number;
  homeStateOfUser: string;
  flightStats: FlightStats;
  createdAt: string;
  updatedAt: string;
  userId: string;
  siteId: string;
  clubId: string;
  teamId: string;
  fixes?: Fix[];
  user: UserData;
  takeoff?: Takeoff;
  club?: Club;
  team?: Club;
  comments?: Comment[];
  photos?: any[]; // TODO: Type this
  airbuddies?: Flight[];
}

export interface Club {
  id: string;
  name: string;
}

export interface Fix {
  timestamp: number;
  time: string;
  pressureAltitude: number;
  gpsAltitude: number;
  elevation: number;
  longitude: number;
  latitude: number;
  speed: number;
  climb: number;
}

export interface FlightStats {
  minHeightBaro: number;
  maxHeightBaro: number;
  minHeightGps: number;
  maxHeightGps: number;
  maxSink: number;
  maxClimb: number;
  maxSpeed: number;
  taskSpeed: number;
}

export interface FlightTurnpoint {
  time: string;
  lat: number;
  long: number;
}

export interface Takeoff {
  id: string;
  shortName: string;
  name: string;
  direction: string;
}
