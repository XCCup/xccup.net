const axios = require("axios");
const debounce = require("lodash/debounce");
const config = require("../config/env-config");
const logger = require("../config/logger");

const elevationUrl = config.get("elevationUrl");
const numberOfFixesPerApiRequest = config.get("useGoogleElevationApi")
  ? 500
  : 50;

const elevationAttacher = {
  execute: (fixes, callback) => {
    getFixesWithElevation(fixes, callback);
  },
};

function createPromise() {
  let resolve, reject;
  let promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return [promise, resolve, reject];
}

function executeRequest(stack) {
  // TODO: Domain was hardcoded in the log…
  logger.debug(`Request Elevation Data at ${elevationUrl}`);

  let locations = stack
    .map(({ fix }) => `${fix.latitude},${fix.longitude}`)
    .join("|");
  let url = `${elevationUrl}?locations=${locations}&nodata_value=0`;
  return axios.get(url);
}

function executeRequestGoogle(stack) {
  logger.debug("Request Elevation Data at Google");

  let locations = [];
  stack.forEach(({ fix }) =>
    locations.push({ lat: fix.latitude, lng: fix.longitude })
  );

  return client.elevation({
    params: {
      locations: locations,
      key: config.get("googleMapsApiKey"),
    },
    timeout: 1000, // milliseconds
  });
}

const resolveStack = debounce(async () => {
  let stack = tmpFixes.splice(0, numberOfFixesPerApiRequest);
  try {
    let response;
    if (config.get("useGoogleElevationApi")) {
      response = await executeRequestGoogle(stack);
    } else {
      response = await executeRequest(stack);
    }
    const jsonData = response.data;
    console.log(jsonData);
    stack.forEach(({ resolve }, index) => {
      const GND = jsonData.results[index].elevation;
      resolve(Math.round(GND));
    });
  } catch (error) {
    logger.error("Error while fetching elevation data: " + error);
  }
  if (tmpFixes.length) {
    resolveStack();
  }
}, 10);

let tmpFixes = [];
const getElevationData = async (fix) => {
  const [promise, resolve] = createPromise();
  tmpFixes.push({ fix, resolve });
  resolveStack();
  return promise;
};

let client;

const getFixesWithElevation = async (fixes, callback) => {
  const _fixesWithElevation = [];
  const { Client } = require("@googlemaps/google-maps-services-js");
  client = new Client({});
  logger.info(
    "Will request elevation data in bunches of " + numberOfFixesPerApiRequest
  );
  await Promise.all(
    fixes.map(async (fix) => {
      fix.elevation = await getElevationData(fix);
      _fixesWithElevation.push(fix);
    })
  );
  logger.info("Finished retrieving elevation data");
  callback(_fixesWithElevation);
};

module.exports = elevationAttacher;
