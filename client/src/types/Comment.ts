export interface Comment {
  message: string;
  userId: string;
  relatedTo?: string;
}

export interface CreateComment extends Comment {
  flightId: string;
}

export interface EditComment extends Comment {
  id: string;
}
