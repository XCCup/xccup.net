const axios = require("axios");
const debounce = require("lodash/debounce");

const host = process.env.ELEVATION_HOST;
const dataset = process.env.ELEVATION_DATASET;
const numberOfFixesPerApiRequest = 50;

const elevationAttacher = {
  execute: (fixes, callback, poped) => {
    getFixesWithElevation(fixes, callback, poped);
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
  let locations = stack
    .map(({ fix }) => `${fix.latitude},${fix.longitude}`)
    .join("|");
  let url = `https://elevation.lurb.org/v1/eudem25m?locations=${locations}&nodata_value=0`;
  console.log("Will execute request: ", url);
  return axios.get(url);
}

const resolveStack = debounce(async () => {
  let stack = tmpFixes.splice(0, numberOfFixesPerApiRequest);
  try {
    const response = await executeRequest(stack);
    const jsonData = response.data;
    stack.forEach(({ resolve }, index) => {
      const GND = jsonData.results[index].elevation;
      resolve(Math.round(GND));
    });
  } catch (error) {
    console.log("Error while fetching elevation data: " + error);
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

const getFixesWithElevation = async (fixes, callback, poped) => {
  const _fixesWithElevation = [];

  await Promise.all(
    fixes.map(async (fix) => {
      fix.elevation = await getElevationData(fix);
      _fixesWithElevation.push(fix);
    })
  );
  console.log("Done!");
  poped.fixes = _fixesWithElevation;
  callback(poped);
};

module.exports = elevationAttacher;
