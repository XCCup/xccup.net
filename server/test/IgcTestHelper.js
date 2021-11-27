const fs = require("fs");
const path = require("path");

const readIgcFile = (folder, file) => {
  const parentDir = path.resolve(__dirname, "..");
  return fs.readFileSync(
    path.join(parentDir, "/igc/demo_igcs", folder, file),
    "utf8"
  );
};

exports.readIgcFile = readIgcFile;
