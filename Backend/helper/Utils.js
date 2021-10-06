function sleep(ms) {
  console.log(`Will dispend thread for ${ms} ms on purpose`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function arrayRemove(array, elementToRemove) {
  array.splice(array.indexOf(elementToRemove));
}

exports.sleep = sleep;
exports.getCurrentYear = getCurrentYear;
exports.arrayRemove = arrayRemove;
