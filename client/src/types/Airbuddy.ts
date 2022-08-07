import type { Fix, Flight } from "@/types/Flight";

export interface BuddyTrack {
  buddyFlightId: string;
  buddyName: string;
  fixes?: Fix[];
  isActive: boolean;
}

export interface Airbuddy {
  externalId: number;
  correlationPercentage: number;
  userFirstName: string;
  userLastName: string;
  userId: string;
}

export interface AirbuddyFlight extends Flight {
  correlationPercentage?: number;
}
