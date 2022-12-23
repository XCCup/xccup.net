import { findLast } from "lodash";
import { Message } from "../parser/etherealMailParser";
const cache: Message[] = [];

export const push = (email: Message) => {
  cache.push(email);
};

export const findLatestForToUser = (toUserEmail: string) => {
  return findLast(cache, (e) => e.to?.includes(toUserEmail));
};
