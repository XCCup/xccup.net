export interface Sponsor {
  id?: string;
  name: string;
  website: string;
  tagline: string;
  isGoldSponsor: boolean;
  sponsorInSeasons: number[];
  contacts: Contact;
  updatedAt?: Date;
  createdAt?: Date;
  logo?: Logo;
}

export interface Contact {
  address: string;
  email: string;
  phone: string;
  phone2: string;
}

export interface Logo {
  id: string;
}
