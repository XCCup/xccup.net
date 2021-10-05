function sleep(ms) {
  console.log(`Will dispend thread for ${ms} ms on purpose`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCurrentYear() {
  return new Date().getFullYear();
}

exports.sleep = sleep;
exports.getCurrentYear = getCurrentYear;
