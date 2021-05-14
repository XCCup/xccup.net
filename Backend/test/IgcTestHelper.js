const fs = require("fs");
const path = require("path");

module.exports = {
  readIgcFile: (folder, file) => {
    const parentDir = path.resolve(__dirname, "..");
    return fs.readFileSync(
      path.join(parentDir, "/igc/demo_igcs", folder, file),
      "utf8"
    );
  },
};
