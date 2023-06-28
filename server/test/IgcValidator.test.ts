/**
 * @jest-environment node
 */
import path from "path";
import fs from "fs";
import { validateIgc } from "../igc/IgcValidator";

test("Validate an igc-File which should result to PASSED", (done) => {
  const igc = {
    name: "AValidFile.igc",
    body: readFile("kai_fai", "fai_60km42_3h53m.igc"),
  };

  validateIgc(igc.body, igc.name)
    .then((result) => {
      expect(result).toBe("PASSED");
      done();
    })
    .catch((error) => done(error));
});

test("Validate an igc-File which should result to PASSED (ANSI Encoding)", (done) => {
  const encoding = "latin1";

  const igc = {
    name: "AValidFile.igc",
    body: readFile("ansi", "77814_36RXXXX1.igc", encoding),
  };

  validateIgc(igc.body, igc.name, encoding)
    .then((result) => {
      expect(result).toBe("PASSED");
      done();
    })
    .catch((error) => done(error));
});

test("Validate an igc-File which should result to FAILED", (done) => {
  const igc = {
    name: "AInvalidFile.igc",
    body: readFile("kai_fai_invalid", "removed_line_20to22.igc"),
  };

  validateIgc(igc.body, igc.name)
    .then((result) => {
      expect(result).toBe("FAILED");
      done();
    })
    .catch((error) => done(error));
});

function readFile(
  folder: string,
  file: string,
  encoding: BufferEncoding = "utf8"
) {
  const parentDir = path.resolve(__dirname, "..");
  const igcFilePath = path.join(parentDir, "/igc/demo_igcs", folder, file);

  return fs.readFileSync(igcFilePath, encoding);
}
