export interface UserDataEssential {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
}

export interface CreateUserData extends Omit<UserData, "id"> {}

export interface UserData extends UserDataEssential {
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
  tshirtSize: string;
  emailInformIfComment: boolean;
  emailTeamSearch: boolean;
  picture?: string;
}
