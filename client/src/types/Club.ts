import type { Contact } from "./Contact";
import type { Logo } from "./Logo";

export interface Club {
  id?: string;
  name: string;
  website?: string;
  participantInSeasons?: number[];
  contact?: Contact[];
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
  website: string;
  contact: Contact[];
}
