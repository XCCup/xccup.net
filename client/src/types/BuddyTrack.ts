import type { Fix } from "@/types/Flight";

export interface BuddyTrack {
  buddyFlightId: string;
  buddyName: string;
  fixes?: Fix[];
  isActive: boolean;
}
