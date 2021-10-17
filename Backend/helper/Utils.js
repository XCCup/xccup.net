async function sleep(ms) {
  console.log(`Will suspend thread for ${ms} ms on purpose`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function arrayRemove(array, elementToRemove) {
  array.splice(array.indexOf(elementToRemove));
}

async function waitTillDbHasSync() {
  const RETRY_TIMEOUT = 3000;
  while (process.env.DB_SYNC_IN_PROGRESS == "true") {
    console.log("Will wait till DB syncing has finished");
    await sleep(RETRY_TIMEOUT);
  }
  console.log("DB syncing finished");
}

exports.sleep = sleep;
exports.getCurrentYear = getCurrentYear;
exports.arrayRemove = arrayRemove;
exports.waitTillDbHasSync = waitTillDbHasSync;
