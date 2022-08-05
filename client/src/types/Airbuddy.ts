import type { Fix } from "@/types/Flight";

export interface BuddyTrack {
  buddyFlightId: string;
  buddyName: string;
  fixes?: Fix[];
  isActive: boolean;
}

export interface Airbuddy {
  externalId: number;
  percentage: number;
  userFirstName: string;
  userLastName: string;
  userId: string;
}
