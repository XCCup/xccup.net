/**
 * 1. Lade Luftraumdaten herunter: https://www.openaip.net/data/exports
 * 3. Lasse den Parser laufen "node AirspaceGeoJson parse [PATH_TO_GEOJSON]"
 * 4. Prüfe das Ergebnis manuell [CURRENTYEAR]_airspaces.json
 * 4a. Alle mit floor = FL100 entfernt
 * 4b. Alle mit class = E die nicht TMZ/RMZ sind entfernt
 * 5. Starte den Upload "node AirspaceGeoJson upload [PATH_TO_JSON] [EMAIL_OF_ADMIN_ACCOUNT] [PASSWORD_ACCOUNT] [USE_PROD=true|false]"
 */

const fs = require("fs");
const axios = require("axios");

const scriptOption = process.argv[2];
const sourcePath = process.argv[3];
const email = process.argv[4];
const password = process.argv[5];
const useProd = process.argv[6];

const devUrl = "http://localhost:3000/api";
const prodUrl = "https://xccup.net/api";

const targetUrl = useProd === "true" ? prodUrl : devUrl;

const currentYear = new Date().getFullYear();

const fileNameJson = currentYear + "_airspaces.json";

if (scriptOption === "parse") {
  parseGeoJSONFile();
}

if (scriptOption === "upload") {
  uploadToServer();
}

async function uploadToServer() {
  console.log("Will upload data to " + targetUrl);

  const airspaces = require(sourcePath);

  const token = await loginToApi(email, password);
  if (!token) return;

  await sendRequestsToApi(airspaces, token);
  console.log("Finished adding airspaces");
}

async function loginToApi(email, password) {
  try {
    console.log("Try to login");
    const result = await axios.post(targetUrl + "/users/login", {
      email,
      password,
    });
    console.log("Login successful");
    return result.data.accessToken;
  } catch (error) {
    console.log("Login not successful");
    return null;
  }
}

async function sendRequestsToApi(airspaces, token) {
  for (const airspace of airspaces) {
    try {
      console.log(
        `Will upload ${airspace.name} ${airspace.floor} ${airspace.ceiling}`
      );
      const res = await axios.post(
        targetUrl + "/airspaces",
        {
          airspace,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Upload successful " + res.data);
    } catch (error) {
      console.error(
        `Error uploading airspace ${airspace.name}: ` +
          JSON.stringify(error.response.data, null, 2)
      );
    }
  }
}

function parseGeoJSONFile() {
  const checkedPath = checkFileEndingConvertIfNecessary(sourcePath);

  console.log("Will parse GeoJSON from " + checkedPath);

  const airspacesFromGeoJSON = require(checkedPath);

  const airspacesForDb = [];

  airspacesFromGeoJSON.features.forEach((e) => {
    airspacesForDb.push({
      class: getClassValue(e.properties.icaoClass),
      name: e.properties.name,
      floor: getHeightValueAsString(e.properties.lowerLimit),
      ceiling: getHeightValueAsString(e.properties.upperLimit),
      polygon: e.geometry,
      season: currentYear,
    });
  });

  fs.writeFile(
    fileNameJson,
    JSON.stringify(airspacesForDb, null, 2),
    "utf8",
    () => {
      console.log("done");
    }
  );
}

function checkFileEndingConvertIfNecessary(path) {
  if (path.toLowerCase().endsWith("geojson")) {
    console.log("Will change file-ending from geojson to json");
    const newPath = path.replace(/.geojson/gi, "_convert.json");
    fs.copyFileSync(path, newPath);
    return newPath;
  }

  return path;
}

function getHeightValueAsString({ value, unit, referenceDatum }) {
  // GND
  if (
    referenceDatum === 0 &&
    (value === 0 || value === null || value === undefined)
  ) {
    return "GND";
  }

  // Flight Level
  if (unit === 6) {
    return `FL${value}`;
  }

  // Meter oder Feet
  let unitStr = unit === 0 ? "m" : unit === 1 ? "ft" : "";
  let refStr = "";
  if (referenceDatum === 0) refStr = "AGL";
  else if (referenceDatum === 1) refStr = "MSL";
  else if (referenceDatum === 2) refStr = "STD";

  let str = value + unitStr;
  if (refStr) str += ` ${refStr}`;
  return str;
}

function getClassValue(icaoClass) {
  switch (icaoClass) {
    case 0:
      return "A";
    case 1:
      return "B";
    case 2:
      return "C";
    case 3:
      return "D";
    case 4:
      return "E";
    case 5:
      return "F";
    case 6:
      return "G";
    default:
      return "Q";
  }
}
