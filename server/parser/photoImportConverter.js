const flights = require("../flightsImport.json");
const users = require("../usersImport.json");
const photos = require("../convertToPhotos.json");
const fs = require("fs");
const { v5: uuidv5 } = require("uuid");
const photoUuidNamespace = "c018b6c5-1712-4313-88df-047bb4468313";

const convertedPhotos = photos.map((entry) => {
  const flight = findFlight(entry.flightId);

  if (!flight) return;

  const year = flight.createdAt.substring(0, 4);

  return {
    id: uuidv5(entry.FileName, photoUuidNamespace),
    path: `data/images/flights/${year}/${entry.FileName}`,
    originalname: entry.FileName,
    description: entry.Beschreibung,
    mimetype: "image/jpeg",
    isExternalLink: false,
    flightId: flight.id,
    userId: findUser(flight.userId).id,
    createdAt: flight.createdAt,
  };
});

function findFlight(value) {
  const found = flights.find((f) => f?.externalId == value);

  if (found) return found;

  console.log("No flight found for: ", value);
}

function findUser(value) {
  const found = users.find((u) => u.id == value);

  if (found) return found;

  console.log("No user found for: ", value);
}

fs.writeFile(
  "photosImport.json",
  JSON.stringify(convertedPhotos, null, 2),
  "utf8",
  (err) => {
    console.log(err);
  }
);
