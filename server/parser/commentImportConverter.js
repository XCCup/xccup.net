const comments = require("../convertToComment1.json");
const users = require("../import/usersImport.json");
const flights = require("../import/flightsImport.json");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

let currentComment = undefined;

const commentsToDelete = [];

var lineReader = readline.createInterface({
  input: fs.createReadStream(
    path.resolve("./20220208_XCCup_FlightComment_02.csv")
  ),
});

lineReader.on("line", function (line) {
  // console.log('Line from file:', line);
  const regex = /(\d+);(.*)/;
  const res = line.match(regex);
  if (res) {
    const id = res[1];
    const messagePart = res[2];
    currentComment = comments.find((c) => c.CommentID == id);
    currentComment.message = messagePart;
    currentComment.createdAt = currentComment.Lupd_Timestamp;
    currentComment.userId = findUserId(currentComment.PilotID);
    currentComment.flightId = findFlightId(currentComment.FlugID);

    if (!(currentComment.userId && currentComment.flightId))
      commentsToDelete.push(id);
  } else {
    currentComment.message += "\n" + line;
  }
});

lineReader.on("close", function () {
  console.log("close");

  commentsToDelete.forEach((c) => console.log(c));

  const filteredComments = comments.filter(
    (c) => !commentsToDelete.includes(c.CommentID)
  );

  fs.writeFile(
    "commentsImport.json",
    JSON.stringify(filteredComments, null, 2),
    "utf8",
    (err) => {
      console.log(err);
    }
  );
});

function findUserId(oldId) {
  const found = users.find((u) => u.oldId == oldId);
  if (found) {
    return found.id;
  }
  console.log("No user found for " + oldId);
}

function findFlightId(oldId) {
  const found = flights.find((f) => f?.externalId == oldId);
  if (found) {
    return found.id;
  }
  console.log("No flight found for " + oldId);
}
