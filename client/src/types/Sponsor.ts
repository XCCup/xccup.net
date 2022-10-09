export interface Sponsor {
  id?: string; // Why is this optional?
  name: string; // Is this safe?
  website?: string;
  tagline?: string;
  isGoldSponsor?: boolean;
  sponsorInSeasons: number[]; // is This safe?
  contact?: Contact;
  updatedAt?: Date;
  createdAt?: Date;
  logo?: Logo;
}

export interface Contact {
  address?: string;
  email?: string;
  phone?: string;
  phone2?: string;
}

export interface Logo {
  id: string;
}
