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
  const header = root.querySelector("#message-header");
  const labels = header?.querySelectorAll("dt");
  const values = header?.querySelectorAll("dd");
  const index = labels?.findIndex((label) => label.text.trim() === element);

  if (index != null && index >= 0) return values?.[index]?.text.trim();
}
