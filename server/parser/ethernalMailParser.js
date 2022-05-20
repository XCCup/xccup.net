const axios = require("axios");
const HTMLParser = require("node-html-parser");

async function retrieveTestMail(url) {
  const res = await axios.get(url);

  // console.log(res.data);

  let root = HTMLParser.parse(res.data);

  return {
    message: root.querySelector(".message-plaintext").text,
    subject: parseMessageHeader(root, 0),
    from: parseMessageHeader(root, 1),
    to: parseMessageHeader(root, 2),
    time: parseMessageHeader(root, 3),
    messageId: parseMessageHeader(root, 4),
  };
}

function parseMessageHeader(root, elementNumber) {
  return (
    root
      .querySelector("#message-header")
      .querySelectorAll("div")
      // eslint-disable-next-line no-unexpected-multiline
      [elementNumber].querySelector("span")
      .text.trim()
  );
}

module.exports = retrieveTestMail;
