declare namespace Express {
  export interface Request {
    user?: {
      firstName: string;
      id: string;
      role: string;
      lastName: string;
      gender: string;
    };
    authStatus?: "NO_AUTH" | "EXPIRED" | "INVALID" | "VALID";
    externalId?: number;
  }
}
