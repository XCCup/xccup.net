import type { UserData } from "./UserData";

export interface NewComment {
  message: string;
  userId: string;
  relatedTo?: string;
  flightId: string;
}

export interface Comment extends NewComment {
  id: string;
  createdAt: string;
  updatedAt: string;
  user?: UserData;
}
