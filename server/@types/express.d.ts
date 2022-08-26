// TODO: Check this out.
declare namespace Express {
  export interface Request {
    user?: { firstName: string; id: string };
    authStatus?: string;
  }
}
