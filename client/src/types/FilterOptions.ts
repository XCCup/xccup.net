import type { UserDataEssential } from "./UserData";

export interface FilterOptions {
  userNames: UserDataEssential[];
  siteNames: {
    id: string;
    name: string;
  }[];
  clubNames: {
    id: string;
    name: string;
  }[];
  teamNames: {
    id: string;
    name: string;
  }[];
  brandNames: string[];
  rankingClasses: RankingClasses;
  regions: string[];
  states: {
    [key: string]: string;
  };
  genders: {
    [key: string]: string;
  };
}

export interface RankingClasses {
  [key: string]: {
    description?: string;
    shortDescription?: string;
    gliderClasses?: string[];
  };
}
