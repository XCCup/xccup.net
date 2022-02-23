"use strict";

const fs = require("fs");
const path = require("path");
const { sanitizeHtml } = require("../helper/Utils");
const users = require("../import/usersImport.json");
const flights = require("../import/flightsImport.json");
const clubs = require("../test/testdatasets/clubs.json");
const teams = require("../import/teamsImport.json");

const tabletojson = require("tabletojson").Tabletojson;

const tableDir = path.resolve(__dirname, "../oldresults/overall");
var files = fs.readdirSync(tableDir);

const results = [];

files.forEach((file) => {
  const season = file.split(".")[0];

  const html = fs.readFileSync(path.resolve(tableDir, file), {
    encoding: "UTF-8",
  });
  const converted = tabletojson.convert(html, {
    stripHtmlFromCells: false,
    ignoreColumns: [0, 1, 5],
  })[0];
  stripHtmlOfColumnsExcept(converted, ["F1", "F2", "F3"]);

  converted.forEach((element) => {
    const user = findUser(element.Pilot);
    if (user) {
      element.user = {
        id: user?.id,
        firstName: user?.firstName,
        lastName: user?.lastName,
      };
    } else {
      element.user = {
        firstName: element.Pilot,
      };
    }

    element.club = {
      name: element.Verein,
      id: findClubId(element.Verein),
    };
    element.team = {
      name: element.Team,
      id: findTeamId(element.Team, season),
    };

    const { totalDistance, totalPoints } = extractTotalData(element["∑"]);
    element.totalDistance = totalDistance;
    element.totalPoints = totalPoints;

    delete element.F1;
    delete element.F2;
    delete element.F3;
    delete element.Team;
    delete element.Verein;
    delete element["∑"];
  });

  results.push({ season, type: "overall", result: converted });
});

fs.writeFile(
  "oldOverallRankings.json",
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
        const flight = extractFlightData(value);
        addGliderToFlightData(flight);
        flights.push(flight);
      }
    }
    element.flights = flights;
  });
}

function addGliderToFlightData(flight) {
  const found = flights.find((f) => f?.externalId == flight?.externalId);
  if (found) {
    flight.id = found.id;
    flight.glider = found.glider;
  }
}

function extractFlightData(value) {
  const regex = /.*flightid="(\d+)">\s+(\d{2,3}).*/;
  const result = value.replace("\n", "").match(regex);

  if (result) {
    return { flightPoints: result[2], externalId: result[1] };
  }
}

function findUser(pilot) {
  const firstName = pilot.split(" ")[1] ?? "";
  const lastName = pilot.split(" ")[0] ?? "";
  if (!firstName || !lastName) console.log("Error parsing: " + pilot);

  let found = users.find(
    (u) => u.firstName == firstName && u.lastName == lastName
  );
  if (found) {
    return found;
  }

  if (pilot == "van der Poel Rob")
    found = users.find((u) => u.id == "a614ff5b-7e2f-5c9f-8fb2-96cfd1ba517a");
  if (pilot == "van Loo Martijn")
    found = users.find((u) => u.id == "4de58cee-09b3-5e1c-94d5-11618775a46f");
  if (pilot == "Schmidt Nicolas Patrick")
    found = users.find((u) => u.id == "a36e5f40-29f4-5701-bde5-b2cb6b0f1548");
  if (pilot == "van Bellen Klaus")
    found = users.find((u) => u.id == "df501ca2-5f26-51a7-9c35-6e24c3384198");
  if (pilot == "Kiefer Michael Vitus")
    found = users.find((u) => u.id == "0b76ac34-f4dc-54d4-8830-a8524aa9b597");
  if (pilot == "Gawlitza Thomas Martin")
    found = users.find((u) => u.id == "9c6a5fa0-5a8e-5b32-b971-5102138c62ec");
  if (`${firstName} ${lastName}` == "Moreno Santin")
    found = users.find((u) => u.id == "2b997eed-7901-56ad-a161-4ae376b76ae1");
  if (`${firstName} ${lastName}` == "Marcus Ruhnow/Schingnitz")
    found = users.find((u) => u.id == "7cf3529f-b98f-501e-a54e-9418f73af5db");
  if (`${firstName} ${lastName}` == "Frank Lang")
    found = users.find((u) => u.id == "9d1455cc-8882-5adb-abe6-5811ba7b3fe9");
  if (`${firstName} ${lastName}` == "Klaus Rottland")
    found = users.find((u) => u.id == "1ba9c1e1-2905-5f17-89f6-3412160c7e1b");
  if (`${firstName} ${lastName}` == "Piotr Josko")
    found = users.find((u) => u.id == "9ab88e58-157f-5130-b84d-0ed967ab284a");
  if (`${firstName} ${lastName}` == "Klaus Wilming")
    found = users.find((u) => u.id == "d51b7cb6-027e-55d8-9069-cbcb0a0e5d79");
  if (`${firstName} ${lastName}` == "Zdzislaw Stankiewicz")
    found = users.find((u) => u.id == "2f01cddc-55fb-5fac-8876-81d815edfa1c");

  if (found) {
    return found;
  }
  console.log(`Found no user for ${pilot}`);
}

function findClubId(clubName) {
  const found = clubs.find((c) => c.name == clubName);
  if (found) {
    return found.id;
  }
  if (clubName == "Drachen und Gleitschirmclub Frankfurt-Rhein-Main")
    return "d1ed2b23-c90f-4d40-bb1f-9d9f44c6fc1c";
  if (clubName == "Ostwindfreunde")
    return "5d13f721-faf5-40af-9926-cb799294e982";

  console.log(`Found no club for ${clubName}`);
}

function findTeamId(teamName, season) {
  const found = teams.find((c) => c.name == teamName && c.season == season);
  if (found) {
    return found.id;
  }

  console.log(`Found no team for ${teamName}`);
}

function extractTotalData(value) {
  const regex = /(\d+).*\((\d+).*km\)/;
  const res = value.match(regex);
  if (res) {
    return { totalPoints: res[1], totalDistance: res[2] };
  }
}
