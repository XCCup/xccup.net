/**
 * @jest-environment node
 */
const IgcValidator = require("../igc/IgcValidator");

test("Validate an igc-File which should result to PASSED", (done) => {
  const igc = {
    name: "AValidFile.igc",
    body: readIgcFile("kai_fai", "fai_60km42_3h53m.igc"),
  };

  IgcValidator.execute(igc)
    .then((result) => {
      expect(result).toBe("PASSED");
      done();
    })
    .catch((error) => done(error));
});

test("Validate an igc-File which should result to FAILED", (done) => {
  const igc = {
    name: "AInvalidFile.igc",
    body: readIgcFile("kai_fai_invalid", "removed_line_20to22.igc"),
  };

  IgcValidator.execute(igc)
    .then((result) => {
      expect(result).toBe("FAILED");
      done();
    })
    .catch((error) => done(error));
});

//TODO Move also to a helper class?
function readIgcFile(folder, file) {
  const fs = require("fs");
  const path = require("path");
  const parentDir = path.resolve(__dirname, "..");
  return fs.readFileSync(
    path.join(parentDir, "/igc/demo_igcs", folder, file),
    "utf8"
  );
}
