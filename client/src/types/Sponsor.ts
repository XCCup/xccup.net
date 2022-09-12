export interface Sponsor {
  id?: string;
  name: string;
  website: string;
  tagline: string;
  isGoldSponsor: boolean;
  sponsorInSeasons: number[];
  contacts: Contact;
  updatedAt?: Date;
}

export interface Contact {
  address: string;
  email: string;
  phone: string;
  phone2: string;
}
