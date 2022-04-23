export interface UserData extends NameUserData {
  birthday: string;
  gender: "M" | "W" | "D";
  clubId: string;
  club: { name: string };
  email: string;
  address: {
    street: string;
    country: string;
    state: string;
    zip: string;
    city: string;
  };
  emailNewsletter: boolean;
  tshirtSize: string;
  emailInformIfComment: boolean;
  emailTeamSearch: boolean;
  picture?: string;
}

export interface NameUserData {
  id: string;
  firstName: string;
  lastName: string;
}

export interface CreateUserData extends Omit<UserData, "id"> {}
