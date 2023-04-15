import type { Contact } from "./Contact";
import type { Logo } from "./Logo";

export interface BaseClub {
  id?: string;
  name: string;
}

export interface Club extends BaseClub {
  shortName: string;
  website?: string;
  participantInSeasons?: number[];
  contacts?: Contact[];
  mapPosition?: Position;
  updatedAt?: Date;
  createdAt?: Date;
  logo?: Logo;
}

interface Position {
  lat: string;
  long: string;
}

export interface NewClub {
  name: string;
  shortName: string;
  website: string;
  contacts: Contact[];
  participantInSeasons: number[];
}
