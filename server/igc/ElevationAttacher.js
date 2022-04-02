const debounce = require("lodash/debounce");
const config = require("../config/env-config");
const logger = require("../config/logger");

const numberOfFixesPerApiRequest = 500;
let client;

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

function executeRequestGoogle(stack) {
  logger.debug("Request Elevation Data from Google");

  const locations = stack.map(({ fix }) => {
    return { lat: fix.latitude, lng: fix.longitude };
  });

  return client.elevation({
    params: {
      locations,
      key: config.get("googleMapsApiKey"),
    },
    timeout: 1000, // milliseconds
  });
}

const resolveStack = debounce(async () => {
  let stack = tmpFixes.splice(0, numberOfFixesPerApiRequest);
  try {
    let response = await executeRequestGoogle(stack);
    const jsonData = response.data;
    stack.forEach(({ resolve }, index) => {
      const GND = jsonData.results[index].elevation;
      resolve(Math.round(GND));
    });
  } catch (error) {
    logger.error("EA: Error while fetching elevation data: " + error);
    stack.forEach(({ resolve }) => {
      resolve(null);
    });
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
/**
 *
 * @param {object} fixes
 * @param {function} callback
 */
const getFixesWithElevation = async (fixes, callback) => {
  const _fixesWithElevation = [];
  const { Client } = require("@googlemaps/google-maps-services-js");
  client = new Client({});

  logger.info(
    "Will request elevation data in bunches of " + numberOfFixesPerApiRequest
  );
  await Promise.all(
    fixes.map(async (fix) => {
      fix.elevation = null;
      if (config.get("useGoogleElevationApi"))
        fix.elevation = await getElevationData(fix);

      _fixesWithElevation.push(fix);
    })
  );
  logger.info("Finished retrieving elevation data");
  callback(_fixesWithElevation);
};

module.exports = elevationAttacher;
