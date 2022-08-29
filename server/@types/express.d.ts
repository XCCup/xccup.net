declare namespace Express {
  export interface Request {
    user?: {
      firstName: string;
      id: string;
      role: string;
      lastName: string;
      gender: string;
    };
    authStatus?: string;
  }
}
