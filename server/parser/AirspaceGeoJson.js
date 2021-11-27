/**
 * 1. Lade Luftraumdaten für Deutschland herunter: https://www.daec.de/fachbereiche/luftraum-flugbetrieb/luftraumdaten/
 * 2. Konvertiere OpenAir Format in GeoJSON: https://mygeodata.cloud/converter/openair-to-geojson
 * 3. Lasse den Parser laufen "node AirspaceGeoJson parse [PATH_TO_GEOJSON]"
 * 4. Prüfe das Ergebnis manuell [CURRENTYEAR]_airspaces.json
 * 5. Starte den Upload "node AirspaceGeoJson upload" (Beachte: DB Port muss erreichbar sein. Ggfs. Script innerhalb des Containers starten)
 */

const fs = require("fs");

const scriptOption = process.argv[2];
if (scriptOption === "parse") {
  const pathToGeoJSON = process.argv[3];
  console.log("Will parse GeoJSON from " + pathToGeoJSON);

  const airspacesFromGeoJSON = require(pathToGeoJSON);

  const airspacesForDb = [];

  airspacesFromGeoJSON.features.forEach((e) => {
    airspacesForDb.push({
      class: e.properties.CLASS,
      name: e.properties.NAME,
      floor: e.properties.FLOOR,
      ceiling: e.properties.CEILING,
      polygon: e.geometry,
    });
  });

  const currentDate = new Date();
  fs.writeFile(
    currentDate.getFullYear() + "_airspaces.json",
    JSON.stringify(airspacesForDb, null, 2),
    "utf8",
    () => {
      console.log("done");
    }
  );
}
if (scriptOption === "upload") {
  const Airspace = require("../model/Airspace");
  console.log("Will upload data to db");

  const currentYear = new Date().getFullYear();
  const airspaces = require("./" + currentYear + "_airspaces.json");

  (async () => {
    await Promise.all(
      airspaces.map(async (entry) => {
        await Airspace.create(entry).catch((err) => {
          console.log(err.message);
        });
      })
    );
    console.log("Finished adding airspaces");
  })();
}
