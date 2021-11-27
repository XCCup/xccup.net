/**
 * @jest-environment node
 */
const IgcValidator = require("../igc/IgcValidator");
const { readIgcFile } = require("./IgcTestHelper");

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
