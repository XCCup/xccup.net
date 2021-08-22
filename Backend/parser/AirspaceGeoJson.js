/**
 * 1. Lade Luftraumdaten für Deutschland herunter: https://www.daec.de/fachbereiche/luftraum-flugbetrieb/luftraumdaten/
 * 2. Konvertiere OpenAir Format in GeoJSON: https://mygeodata.cloud/converter/openair-to-geojson
 * 3. Passe den Pfad der GeoJSON in diesem Parser an
 * 4. Starte den Parser
 */

const fs = require("fs");

const airspacesFromGeoJSON = require("../../XCCup_DB_Schema/2021_05_Airspace_Germany/airspaces.json");

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

fs.writeFile(
  "airspaces.json",
  JSON.stringify(airspacesForDb, null, 2),
  "utf8",
  () => {
    console.log("done");
  }
);
