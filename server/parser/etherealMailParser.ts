import axios from "axios";
import HTMLParser, { HTMLElement } from "node-html-parser";

export interface Message {
  message?: string;
  subject?: string;
  from?: string;
  to?: string;
  time?: string;
  messageId?: string;
}

export async function retrieveTestMail(url: string) {
  const res = await axios.get(url);

  let root = HTMLParser.parse(res.data);

  const message: Message = {
    message: root.querySelector(".message-plaintext")?.text,
    subject: parseMessageHeader(root, "Subject"),
    from: parseMessageHeader(root, "From"),
    to: parseMessageHeader(root, "To"),
    time: parseMessageHeader(root, "Time"),
    messageId: parseMessageHeader(root, "Message-ID"),
  };

  return message;
}

function parseMessageHeader(root: HTMLElement, element: string) {
  const divs = root.querySelector("#message-header")?.querySelectorAll("div");

  const found = divs?.find((d) => d.text.includes(element));
  if (found) return found.querySelector("span")?.text.trim();
}
