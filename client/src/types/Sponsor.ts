import type { Contact } from "./Contact";
import type { Logo } from "./Logo";

export interface Sponsor {
  id?: string;
  name: string;
  website?: string;
  tagline?: string;
  isGoldSponsor: boolean;
  sponsorInSeasons?: number[];
  contact?: Contact;
  updatedAt?: Date;
  createdAt?: Date;
  logo?: Logo;
}

export interface NewSponsor {
  name: string;
  website: string;
  tagline: string;
  isGoldSponsor: boolean;
  sponsorInSeasons: number[];
  contact: Contact;
}
