const axios = require("axios");
const HTMLParser = require("node-html-parser");

async function retrieveTestMail(url) {
  const res = await axios.get(url);

  let root = HTMLParser.parse(res.data);

  return {
    message: root.querySelector(".message-plaintext").text,
    subject: parseMessageHeader(root, "Subject"),
    from: parseMessageHeader(root, "From"),
    to: parseMessageHeader(root, "To"),
    time: parseMessageHeader(root, "Time"),
    messageId: parseMessageHeader(root, "Message-ID"),
  };
}

function parseMessageHeader(root, element) {
  const divs = root.querySelector("#message-header").querySelectorAll("div");

  const found = divs.find((d) => d.text.includes(element));
  if (found) return found.querySelector("span").text.trim();
}

module.exports = retrieveTestMail;
