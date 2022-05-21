const debounce = require("lodash/debounce");
const config = require("../config/env-config").default;

const logger = require("../config/logger");

const { Client } = require("@googlemaps/google-maps-services-js");

const numberOfFixesPerApiRequest = 500;
const MAX_FIX_DECIMALS = 5;
const client = new Client();

const elevationAttacher = {
  execute: (fixes, callback) => {
    getFixesWithElevation(fixes, callback);
  },

  executeWithPromise: (fixes) => {
    return new Promise((resolve, reject) => {
      try {
        elevationAttacher.execute(fixes, (fixesWithElevation) => {
          resolve(fixesWithElevation);
        });
      } catch (error) {
        reject(error);
      }
    });
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

function maxDecimals(number, maxDecimals) {
  return Number.parseFloat(number).toFixed(maxDecimals);
}

function executeRequestGoogle(stack) {
  logger.debug("Request Elevation Data from Google");

  const locations = stack.map(({ fix }) => {
    return {
      lat: maxDecimals(fix.latitude, MAX_FIX_DECIMALS),
      lng: maxDecimals(fix.longitude, MAX_FIX_DECIMALS),
    };
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
    // TODO: Notify admins
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
