"use strict";

const fs = require("fs");
const path = require("path");
const { sanitizeHtml } = require("../helper/Utils");
const users = require("../import/usersImport.json");

const tabletojson = require("tabletojson").Tabletojson;

const tableDir = path.resolve(__dirname, "../oldresults/teams");
var files = fs.readdirSync(tableDir);

const results = [];

files.forEach((file) => {
  const season = file.split(".")[0];

  const html = fs.readFileSync(path.resolve(tableDir, file), {
    encoding: "UTF-8",
  });
  const converted = tabletojson.convert(html, {
    stripHtmlFromCells: false,
    ignoreColumns: [0, 5, 9],
  })[0];
  stripHtmlOfColumnsExcept(converted, ["F1", "F2", "F3"]);
  const aggreatedResOfYear = aggregateOverTeam(converted);

  results.push({ season, type: "team", result: aggreatedResOfYear });
});

fs.writeFile(
  "oldTeamRankings.json",
  JSON.stringify(results, null, 2),
  "utf8",
  (err) => {
    console.log(err);
  }
);

function stripHtmlOfColumnsExcept(jsonObject, exceptColumnsArray) {
  jsonObject.forEach((element) => {
    const flights = [];
    for (let [key, value] of Object.entries(element)) {
      if (!exceptColumnsArray.includes(key)) {
        element[key] = sanitizeHtml(value).trim();
      } else {
        const newLocal = extractFlightData(value);
        flights.push(newLocal);
      }
    }
    element.flights = flights;
  });
}

function extractFlightData(value) {
  const regex = /.*flightid="(\d+)">\s+(\d{2,3}).*/;
  const result = value.replace("\n", "").match(regex);

  if (result) {
    return { flightPoints: result[2], externalId: result[1] };
  }
}

function aggregateOverTeam(jsonObject) {
  const result = [];
  jsonObject.forEach((element) => {
    const totalData = extractTotalData(element["∑"]);
    const firstName = element.Pilot.split(" ")[1] ?? "";
    const lastName = element.Pilot.split(" ")[0] ?? "";
    if (!firstName || !lastName) console.log("Error parsing: " + element.Pilot);
    const member = {
      firstName,
      lastName,
      flights: element.flights,
      id: findUserId(firstName, lastName),
      ...totalData,
    };
    if (element.Team) {
      const totalData = extractTotalData(element["Punkte/Strecke"]);
      result.push({
        name: element.Team,
        members: [member],
        ...totalData,
      });
    } else {
      result[result.length - 1].members.push(member);
    }
  });

  return result;
}

function extractTotalData(value) {
  const regex = /(\d+).*\((\d+).*km\)/;
  const res = value.match(regex);
  if (res) {
    return { totalPoints: res[1], totalDistance: res[2] };
  }
}

function findUserId(firstName, lastName) {
  const found = users.find(
    (u) => u.firstName == firstName && u.lastName == lastName
  );
  if (found) {
    return found.id;
  }

  if (`${firstName} ${lastName}` == "Moreno Santin")
    return "2b997eed-7901-56ad-a161-4ae376b76ae1";
  if (`${firstName} ${lastName}` == "Marcus Ruhnow/Schingnitz")
    return "7cf3529f-b98f-501e-a54e-9418f73af5db";
  if (`${firstName} ${lastName}` == "Frank Lang")
    return "9d1455cc-8882-5adb-abe6-5811ba7b3fe9";
  if (`${firstName} ${lastName}` == "Klaus Rottland")
    return "1ba9c1e1-2905-5f17-89f6-3412160c7e1b";
  console.log(`Found no user for ${firstName} ${lastName}`);
}
